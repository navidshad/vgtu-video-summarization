import { GoogleGenAI } from '@google/genai';
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
	async generateText(prompt: string, modelName: string = GEMINI_MODEL): Promise<string> {
		const response = await this.client.models.generateContent({
			model: modelName,
			contents: [{ role: 'user', parts: [{ text: prompt }] }]
		});

		return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
	}

	/**
	 * Generates a structured result (JSON) from Gemini based on a schema.
	 */
	async generateStructuredText<T>(
		prompt: string,
		schema: any,
		modelName: string = GEMINI_MODEL
	): Promise<T> {
		const response = await this.client.models.generateContent({
			model: modelName,
			contents: [{ role: 'system', parts: [{ text: prompt }] }],
			config: {
				responseMimeType: 'application/json',
				responseSchema: schema
			}
		});

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
		prompt: string,
		fileUris: string[],
		modelName: string = GEMINI_MODEL
	): Promise<string> {
		const contents = [
			{
				role: 'user',
				parts: [
					...fileUris.map((uri) => ({ fileData: { fileUri: uri, mimeType: 'audio/mpeg' } })),
					{ text: prompt }
				]
			}
		];

		const response = await this.client.models.generateContent({
			model: modelName,
			contents
		});

		return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
	}

	/**
	 * Generates a structured result (JSON) from Gemini based on files and a prompt.
	 */
	async generateStructuredFromFiles<T>(
		prompt: string,
		fileUris: string[],
		schema: any,
		modelName: string = GEMINI_MODEL
	): Promise<T> {
		const contents = [
			{
				role: 'user',
				parts: [
					...fileUris.map(uri => ({ fileData: { fileUri: uri, mimeType: 'audio/mpeg' } })), // Defaulting to audio/mpeg as per task
					{ text: prompt }
				]
			}
		];

		const response = await this.client.models.generateContent({
			model: modelName,
			contents,
			config: {
				responseMimeType: 'application/json',
				responseSchema: schema
			}
		});

		const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

		try {
			return JSON.parse(text) as T;
		} catch (error) {
			console.error('Failed to parse Gemini structured response:', text);
			throw new Error('Invalid JSON response from Gemini');
		}
	}
}
