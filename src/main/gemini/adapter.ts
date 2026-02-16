import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';
import { Usage, UsageRecord } from '../../shared/types';
import { settingsManager } from '../settings';
import * as fs from 'fs';
import * as path from 'path';
import { sanitizeFilename } from '../ffmpeg';


export class GeminiAdapter {
	private client: GoogleGenAI;

	constructor(apiKey: string) {
		this.client = new GoogleGenAI({
			apiKey,
			apiVersion: 'v1alpha' // Using v1alpha for latest features like thinking
		});
	}

	/**
	 * Static factory method to create an instance with an API key from settings.
	 */
	static create(): GeminiAdapter {
		const apiKey = settingsManager.getGeminiApiKey();
		if (!apiKey) {
			throw new Error('Gemini API key not found in settings. Please provide it in the API Key page.');
		}
		return new GeminiAdapter(apiKey);
	}

	private extractUsage(response: any): Usage {
		const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0, thoughtsTokenCount: 0 };
		return {
			promptTokens: usage.promptTokenCount!,
			candidatesTokens: usage.candidatesTokenCount!,
			thinkingTokens: usage.thoughtsTokenCount,
			totalTokens: usage.totalTokenCount!
		};
	}

	/**
	 * Generates a non-structured result from Gemini.
	 */
	async generateText(
		modelName: string,
		userPrompt: string,
		systemInstruction?: string
	): Promise<{ text: string, record: UsageRecord }> {
		const request: GenerateContentParameters = {
			model: modelName,
			contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
		};

		if (systemInstruction) {
			request.config = {
				systemInstruction: systemInstruction
			};
		}

		const response = await this.client.models.generateContent(request);
		const usage = this.extractUsage(response);
		const cost = GeminiAdapter.calculateCost(modelName, usage);

		return {
			text: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
			record: { usage, cost }
		};
	}

	/**
	 * Generates a structured result (JSON) from Gemini based on a schema.
	 */
	async generateStructuredText<T>(
		modelName: string,
		userPrompt: string,
		schema: any,
		systemInstruction?: string
	): Promise<{ data: T, record: UsageRecord }> {
		const request: GenerateContentParameters = {
			model: modelName,
			contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
			config: {
				responseMimeType: 'application/json',
				responseSchema: schema
			}
		};

		if (systemInstruction) {
			request.config!.systemInstruction = systemInstruction;
		}

		const totalUsage: Usage = { promptTokens: 0, candidatesTokens: 0, thinkingTokens: 0, totalTokens: 0 };
		let totalCost = 0;
		const MAX_RETRIES = 3;

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			const response = await this.client.models.generateContent(request);
			const usage = this.extractUsage(response);
			const cost = GeminiAdapter.calculateCost(modelName, usage);

			// Accumulate usage and cost
			totalUsage.promptTokens += usage.promptTokens;
			totalUsage.candidatesTokens += usage.candidatesTokens;
			totalUsage.thinkingTokens = (totalUsage.thinkingTokens || 0) + (usage.thinkingTokens || 0);
			totalUsage.totalTokens += usage.totalTokens;
			totalCost += cost;

			const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

			try {
				return {
					data: JSON.parse(text) as T,
					record: { usage: totalUsage, cost: totalCost }
				};
			} catch (error) {
				console.error(`Attempt ${attempt} - Failed to parse Gemini structured response:`, text);
				if (attempt === MAX_RETRIES) {
					throw new Error('Invalid JSON response from Gemini after multiple attempts');
				}
				// Optional: add a small delay or log the retry
			}
		}

		throw new Error('Unexpected fallthrough in generateStructuredText');
	}

	/**
	 * Uploads a file to the Gemini File API.
	 */
	async uploadFile(filePath: string, mimeType: string): Promise<string> {
		console.log('--- [DEBUG] uploadFile starting ---');
		const rawName = path.basename(filePath);

		const isASCII = /^[\x00-\x7F]*$/.test(filePath);
		let uploadPath = filePath;
		let isTemp = false;

		// If path is not ASCII, create a temporary safe copy
		if (!isASCII) {
			const safeName = sanitizeFilename(rawName);
			const tempPath = path.join(path.dirname(filePath), `gemini_upload_tmp_${Date.now()}_${safeName}`);
			fs.copyFileSync(filePath, tempPath);
			uploadPath = tempPath;
			isTemp = true;
		}

		// Sanitize displayName to ASCII only to avoid terminal TypeError: Cannot convert argument to a ByteString
		const sanitizedName = sanitizeFilename(rawName);

		try {
			const response = await this.client.files.upload({
				file: uploadPath,
				config: {
					mimeType,
					displayName: sanitizedName
				}
			});
			return response.uri || '';
		} finally {
			if (isTemp && fs.existsSync(uploadPath)) {
				try { fs.unlinkSync(uploadPath); } catch (e) { console.error('Failed to remove temp upload file:', e); }
			}
		}
	}


	/**
	 * Generates a text result from Gemini using files.
	 */
	async generateTextFromFiles(
		modelName: string,
		userPrompt: string,
		fileUris: string[],
		systemInstruction?: string,
		audioDuration: number = 0
	): Promise<{ text: string, record: UsageRecord }> {
		const contents = [
			{
				role: 'user',
				parts: [
					...fileUris.map((uri) => ({ fileData: { fileUri: uri, mimeType: 'audio/mpeg' } })),
					{ text: userPrompt }
				]
			}
		];

		const request: GenerateContentParameters = {
			model: modelName,
			contents
		};

		if (systemInstruction) {
			request.config = {
				systemInstruction: systemInstruction
			};
		}

		const response = await this.client.models.generateContent(request);
		const usage = this.extractUsage(response);
		const cost = GeminiAdapter.calculateCost(modelName, usage, audioDuration);

		return {
			text: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
			record: { usage, cost }
		};
	}

	/**
	 * Generates a structured result (JSON) from Gemini based on files and a prompt.
	 */
	async generateStructuredFromFiles<T>(
		modelName: string,
		userPrompt: string,
		fileUris: string[],
		schema: any,
		systemInstruction?: string,
		audioDuration: number = 0
	): Promise<{ data: T, record: UsageRecord }> {
		const contents = [
			{
				role: 'user',
				parts: [
					...fileUris.map(uri => ({ fileData: { fileUri: uri, mimeType: 'audio/mpeg' } })),
					{ text: userPrompt }
				]
			}
		];

		const request: GenerateContentParameters = {
			model: modelName,
			contents,
			config: {
				responseMimeType: 'application/json',
				responseSchema: schema
			}
		};

		if (systemInstruction) {
			request.config!.systemInstruction = systemInstruction;
		}

		const totalUsage: Usage = { promptTokens: 0, candidatesTokens: 0, thinkingTokens: 0, totalTokens: 0 };
		let totalCost = 0;
		const MAX_RETRIES = 3;

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			const response = await this.client.models.generateContent(request);
			const usage = this.extractUsage(response);
			const cost = GeminiAdapter.calculateCost(modelName, usage, audioDuration);

			// Accumulate usage and cost
			totalUsage.promptTokens += usage.promptTokens;
			totalUsage.candidatesTokens += usage.candidatesTokens;
			totalUsage.thinkingTokens = (totalUsage.thinkingTokens || 0) + (usage.thinkingTokens || 0);
			totalUsage.totalTokens += usage.totalTokens;
			totalCost += cost;

			const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

			try {
				return {
					data: JSON.parse(text) as T,
					record: { usage: totalUsage, cost: totalCost }
				};
			} catch (error) {
				console.error(`Attempt ${attempt} - Failed to parse Gemini structured response:`, text);
				if (attempt === MAX_RETRIES) {
					throw new Error('Invalid JSON response from Gemini after multiple attempts');
				}
			}
		}

		throw new Error('Unexpected fallthrough in generateStructuredFromFiles');
	}

	/**
	 * Calculates the cost of a request based on usage and model.
	 * @param audioDuration Duration of audio in seconds if multimodal call.
	 */
	static calculateCost(model: string, usage: Usage, audioDuration: number = 0): number {
		const modelSettings = settingsManager.getModelSettings();
		const pricing = modelSettings.pricing[model];
		if (!pricing) return 0;

		let inputCost = 0;
		let outputCost = 0;

		if (pricing.input.threshold !== undefined) {
			// Pro pricing (threshold based)
			const inputPro = pricing.input;
			const outputPro = pricing.output;
			const isLongContext = usage.promptTokens > (inputPro.threshold || 200000);

			const inputRate = isLongContext ? (inputPro.longContext || inputPro.standard) : inputPro.standard;
			const outputRate = isLongContext ? (outputPro.longContext || outputPro.standard) : outputPro.standard;

			inputCost = (usage.promptTokens / 1000000) * inputRate;
			// Output price applies to both candidates and thinking tokens
			const totalOutputTokens = usage.candidatesTokens + (usage.thinkingTokens || 0);
			outputCost = (totalOutputTokens / 1000000) * outputRate;
		} else {
			// Flash pricing (type based breakdown)
			const flashInput = pricing.input;

			// According to official docs: 1 second of audio = 33 tokens
			const audioTokens = audioDuration > 0 ? Math.min(usage.promptTokens, Math.round(audioDuration * 33)) : 0;
			const textTokens = usage.promptTokens - audioTokens;

			const audioRate = flashInput.audio ?? flashInput.standard;
			const textRate = flashInput.text ?? flashInput.standard;

			inputCost = (audioTokens / 1000000 * audioRate) + (textTokens / 1000000 * textRate);

			// Output price applies to both candidates and thinking tokens
			const totalOutputTokens = usage.candidatesTokens + (usage.thinkingTokens || 0);
			outputCost = (totalOutputTokens / 1000000) * pricing.output.standard;
		}

		return inputCost + outputCost;
	}
}
