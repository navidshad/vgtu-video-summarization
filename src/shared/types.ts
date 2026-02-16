
export enum MessageRole {
	User = 'user',
	AI = 'ai'
}

export enum FileType {
	Preview = 'preview',
	Actual = 'actual',
	Original = 'original'
}

export interface Attachment {
	url: string;
	type: FileType;
}

export interface Usage {
	promptTokens: number;
	candidatesTokens: number;
	thinkingTokens?: number;
	totalTokens: number;
}

export interface UsageRecord {
	usage: Usage;
	cost: number;
}

export interface Message {
	id: string;
	role: MessageRole;
	content: string;
	isPending: boolean;
	files?: Attachment[];
	timeline?: TimelineSegment[];
	usage?: Usage;
	cost?: number;
	version?: number;
	editRefId?: string;
	createdAt: number;
}

export interface Thread {
	id: string
	title: string
	videoPath: string
	preprocessing: {
		audioPath?: string
		lowResVideoPath?: string;
		transcriptPath?: string;
		rawTranscriptPath?: string;
		correctedTranscriptPath?: string;
	}
	tempDir: string
	messages: Message[]
	versionCounter?: number
	createdAt: number
	updatedAt: number
}

export interface TimelineSegment {
	index: number
	start: string
	end: string
	text: string
	duration: number
}

export interface IntentResult {
	type: 'text' | 'generate-timeline';
	content: string; // Brief description or the text answer
	duration?: number; // Duration in seconds
}

export interface ModelPricing {
	input: {
		standard: number
		longContext?: number // Only for Pro
		threshold?: number   // Only for Pro
		text?: number        // Only for Flash
		audio?: number       // Only for Flash
	}
	output: {
		standard: number
		longContext?: number // Only for Pro
		threshold?: number   // Only for Pro
	}
}

export type OperationType = 'raw-transcript' | 'corrected-transcript' | 'intent' | 'timeline-new' | 'timeline-edit'

export interface ModelSelection {
	[key: string]: string // operation -> model name
}

export interface ModelSettings {
	pricing: Record<string, ModelPricing>
	selection: ModelSelection
}