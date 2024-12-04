import type { MessageBroker } from "../message-broker";
import type { Message, MessageType } from "../messages/message";

export type Handler = (message: Message) => unknown;

export abstract class Actor {
	constructor(protected readonly messageBroker: MessageBroker) {
		this.messageBroker.register(this);
		this.messages = [];
		this.handlers = new Map<MessageType, Handler>();
	}

	protected readonly messages: Message[];
	protected readonly handlers: Map<MessageType, Handler>;

	receive(message: Message): void {
		this.messages.push(message);
	}

	update(): void {
		while (this.messages.length > 0) {
			const message = this.messages.shift();
			if (message) {
				this.handleMessage(message);
			}
		}
	}

	destroy(): void {}

	protected handleMessage(message: Message): void {
		const handler = this.handlers.get(message.type);
		if (handler) {
			handler(message);
		}
	}
}
