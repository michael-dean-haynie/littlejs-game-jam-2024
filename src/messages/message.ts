export interface Message {
	type: MessageType;
}

export const MessageTypes = ["CreateUnitMessage"] as const;
export type MessageType = (typeof MessageTypes)[number];

export function IsMessageType(value: string | null): value is MessageType {
	return MessageTypes.includes(value as MessageType);
}
