import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from '../constants/gemini';

export class GeminiAdapter {
	private client: GoogleGenAI;

	constructor(apiKey: string) {
		this.client = new GoogleGenAI({
			apiKey,
			apiVersion: 'v1alpha' // Using v1alpha for latest features like thinking
		});
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
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
