import { ModelSettings } from '../../shared/types'

export const GEMINI_MODEL_2_5_PRO = 'gemini-2.5-pro'
export const GEMINI_MODEL_2_5_FLASH = 'gemini-2.5-flash'
export const GEMINI_MODEL_2_5_FLASH_LITE = 'gemini-2.5-flash-lite'
export const GEMINI_MODEL_3_FLASH_PREVIEW = 'gemini-3-flash-preview'

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
	pricing: {
		[GEMINI_MODEL_2_5_PRO]: {
			input: {
				standard: 1.25,
				longContext: 2.50,
				threshold: 200000
			},
			output: {
				standard: 10.00,
				longContext: 15.00,
				threshold: 200000
			}
		},
		[GEMINI_MODEL_2_5_FLASH]: {
			input: {
				text: 0.30,
				audio: 1.00,
				standard: 0.30 // Fallback for simple calc
			},
			output: {
				standard: 2.50
			}
		},
		[GEMINI_MODEL_2_5_FLASH_LITE]: {
			input: {
				text: 0.10,
				audio: 0.30,
				standard: 0.10
			},
			output: {
				standard: 0.40
			}
		},
		[GEMINI_MODEL_3_FLASH_PREVIEW]: {
			input: {
				text: 0.50,
				audio: 1.00,
				standard: 0.50
			},
			output: {
				standard: 3.00
			}
		}
	},
	selection: {
		'raw-transcript': GEMINI_MODEL_2_5_FLASH_LITE,
		'corrected-transcript': GEMINI_MODEL_2_5_FLASH,
		'intent': GEMINI_MODEL_2_5_FLASH,
		'timeline-new': GEMINI_MODEL_3_FLASH_PREVIEW,
		'timeline-edit': GEMINI_MODEL_2_5_FLASH
	}
}
