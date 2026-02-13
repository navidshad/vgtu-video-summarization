
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
	timeline?: any;
	createdAt: number;
}
