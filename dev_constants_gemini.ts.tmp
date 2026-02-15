export const GEMINI_MODEL = 'gemini-2.5-pro'
export const GEMINI_MODEL_FLASH_THINKING = 'gemini-2.5-flash'

/**
 * Gemini Pricing (USD per 1M tokens)
 * Based on provided screenshots for Gemini 2.5 Pro and Flash.
 */
export const GEMINI_PRICING = {
	[GEMINI_MODEL]: {
		input: {
			standard: 1.25,
			longContext: 2.50, // > 200k tokens
			threshold: 200000
		},
		output: {
			standard: 10.00,
			longContext: 15.00,
			threshold: 200000
		}
	},
	[GEMINI_MODEL_FLASH_THINKING]: {
		input: {
			text: 0.30,
			audio: 1.00
		},
		output: {
			standard: 2.50
		}
	}
}
