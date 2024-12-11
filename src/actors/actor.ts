import { v4 } from "uuid";
import type { Message } from "../messages/message";
import type { MessageBroker } from "../messages/message-broker";
import type { ActorDirectory } from "./actor-directory";

export abstract class Actor {
	constructor(
		protected readonly actorDirectory: ActorDirectory,
		protected readonly messageBroker: MessageBroker,
	) {
		this._messages = [];
		this.actorId = v4();
		this.actorDirectory.registerActor(this);
		this._destroyed = false;
	}

	readonly actorId: string;

	private _destroyed: boolean;
	get destroyed(): boolean {
		return this._destroyed;
	}
	protected set destroyed(value: boolean) {
		this._destroyed = value;
	}

	private readonly _messages: Message[];

	destroy(): void {
		this.actorDirectory.unregisterActor(this.actorId);
		this.destroyed = true;
	}

	receiveMessage<T extends Message>(message: T): void {
		this._messages.push(message);
	}

	update(): void {
		while (this._messages.length > 0) {
			const message = this._messages.shift();
			if (message) {
				if (this.destroyed) {
					break;
				}
				this.handleMessage(message);
			}
		}
	}

	protected abstract handleMessage<T extends Message>(message: T): void;
}
