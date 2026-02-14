
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

export interface Message {
	id: string;
	role: MessageRole;
	content: string;
	isPending: boolean;
	files?: Attachment[];
	timeline?: TimelineSegment[];
	createdAt: number;
}

export interface Thread {
	id: string
	title: string
	videoPath: string
	preprocessing: {
		audioPath?: string
		lowResVideoPath?: string;
		srtPath?: string;
	}
	tempDir: string
	messages: Message[]
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