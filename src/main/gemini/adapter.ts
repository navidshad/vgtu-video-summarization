import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';
import { GEMINI_MODEL, GEMINI_PRICING } from '../constants/gemini';
import { Usage, UsageRecord } from '../../shared/types';
import { settingsManager } from '../settings';

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
		userPrompt: string,
		systemInstruction?: string,
		modelName: string = GEMINI_MODEL
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
		userPrompt: string,
		schema: any,
		systemInstruction?: string,
		modelName: string = GEMINI_MODEL
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

		const response = await this.client.models.generateContent(request);
		const usage = this.extractUsage(response);
		const cost = GeminiAdapter.calculateCost(modelName, usage);
		const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

		try {
			return {
				data: JSON.parse(text) as T,
				record: { usage, cost }
			};
		} catch (error) {
			console.error('Failed to parse Gemini structured response:', text);
			throw new Error('Invalid JSON response from Gemini');
		}
	}

	/**
	 * Uploads a file to the Gemini File API.
	 */
	async uploadFile(filePath: string, mimeType: string): Promise<string> {
		const response = await this.client.files.upload({
			file: filePath,
			config: {
				mimeType,
				displayName: filePath.split('/').pop()
			}
		});

		return response.uri || '';
	}

	/**
	 * Generates a text result from Gemini using files.
	 */
	async generateTextFromFiles(
		userPrompt: string,
		fileUris: string[],
		systemInstruction?: string,
		audioDuration: number = 0,
		modelName: string = GEMINI_MODEL
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
		userPrompt: string,
		fileUris: string[],
		schema: any,
		systemInstruction?: string,
		audioDuration: number = 0,
		modelName: string = GEMINI_MODEL
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

		const response = await this.client.models.generateContent(request);
		const usage = this.extractUsage(response);
		const cost = GeminiAdapter.calculateCost(modelName, usage, audioDuration);
		const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

		try {
			return {
				data: JSON.parse(text) as T,
				record: { usage, cost }
			};
		} catch (error) {
			console.error('Failed to parse Gemini structured response:', text);
			throw new Error('Invalid JSON response from Gemini');
		}
	}

	/**
	 * Calculates the cost of a request based on usage and model.
	 * @param audioDuration Duration of audio in seconds if multimodal call.
	 */
	static calculateCost(model: string, usage: Usage, audioDuration: number = 0): number {
		const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING];
		if (!pricing) return 0;

		let inputCost = 0;
		let outputCost = 0;

		if ('threshold' in pricing.input) {
			// Pro pricing (threshold based)
			const inputPro = pricing.input as { standard: number; longContext: number; threshold: number };
			const outputPro = pricing.output as { standard: number; longContext: number; threshold: number };
			const isLongContext = usage.promptTokens > inputPro.threshold;

			const inputRate = isLongContext ? inputPro.longContext : inputPro.standard;
			const outputRate = isLongContext ? outputPro.longContext : outputPro.standard;

			inputCost = (usage.promptTokens / 1000000) * inputRate;
			// Output price applies to both candidates and thinking tokens
			const totalOutputTokens = usage.candidatesTokens + (usage.thinkingTokens || 0);
			outputCost = (totalOutputTokens / 1000000) * outputRate;
		} else {
			// Flash pricing (type based breakdown)
			const flashInput = pricing.input as { text: number; audio: number };

			// According to official docs: 1 second of audio = 33 tokens
			const audioTokens = Math.min(usage.promptTokens, Math.round(audioDuration * 33));
			const textTokens = usage.promptTokens - audioTokens;

			inputCost = (audioTokens / 1000000 * flashInput.audio) + (textTokens / 1000000 * flashInput.text);

			// Output price applies to both candidates and thinking tokens
			const totalOutputTokens = usage.candidatesTokens + (usage.thinkingTokens || 0);
			outputCost = (totalOutputTokens / 1000000) * pricing.output.standard;
		}

		return inputCost + outputCost;
	}
}
