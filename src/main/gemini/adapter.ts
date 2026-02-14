import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';
import { GEMINI_MODEL } from '../constants/gemini';
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

	/**
	 * Generates a non-structured result from Gemini.
	 */
	async generateText(
		userPrompt: string,
		systemInstruction?: string,
		modelName: string = GEMINI_MODEL
	): Promise<string> {
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

		return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
	}

	/**
	 * Generates a structured result (JSON) from Gemini based on a schema.
	 */
	async generateStructuredText<T>(
		userPrompt: string,
		schema: any,
		systemInstruction?: string,
		modelName: string = GEMINI_MODEL
	): Promise<T> {
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

		const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

		try {
			return JSON.parse(text) as T;
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
		modelName: string = GEMINI_MODEL
	): Promise<string> {
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

		return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
	}

	/**
	 * Generates a structured result (JSON) from Gemini based on files and a prompt.
	 */
	async generateStructuredFromFiles<T>(
		userPrompt: string,
		fileUris: string[],
		schema: any,
		systemInstruction?: string,
		modelName: string = GEMINI_MODEL
	): Promise<T> {
		const contents = [
			{
				role: 'user',
				parts: [
					...fileUris.map(uri => ({ fileData: { fileUri: uri, mimeType: 'audio/mpeg' } })), // Defaulting to audio/mpeg as per task
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

		const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

		try {
			return JSON.parse(text) as T;
		} catch (error) {
			console.error('Failed to parse Gemini structured response:', text);
			throw new Error('Invalid JSON response from Gemini');
		}
	}
}
