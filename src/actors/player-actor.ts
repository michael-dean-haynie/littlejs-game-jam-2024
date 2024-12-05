import { vec2 } from "littlejsengine";
import type { MessageBroker } from "../message-broker";
import {
	CreateUnitMessage,
	IsCreateUnitMessage,
} from "../messages/create-unit-message";
import type { Message } from "../messages/message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { UnitTypes } from "../units/unit";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { UnitActor } from "./unit-actor";

export class PlayerActor extends Actor {
	constructor(messageBroker: MessageBroker) {
		super(messageBroker);

		// register message handlers
		this.handlers.set("CreateUnitMessage", this.handleCreateUnitMessage);
		this.handlers.set("UnitHasDiedMessage", this.handleUnitHasDiedMessage);

		// create unit for player
		this.messageBroker.publish(
			new CreateUnitMessage({
				unitType: UnitTypes.prey,
				position: messageBroker.pathingHelper.worldSize.scale(0.5),
				team: "player",
			}),
		);
	}

	private _playerUnitId?: string;

	get playerUnitId(): string {
		return this._playerUnitId ?? yeet("UNEXPECTED_NULLISH_VALUE");
	}

	private handleCreateUnitMessage = (message: Message): void => {
		if (IsCreateUnitMessage(message)) {
			if (message.team === "player") {
				const unitActor = new UnitActor(this.messageBroker, message);
				this._playerUnitId = unitActor.unitId;
			}
		}
	};

	private handleUnitHasDiedMessage = (message: Message): void => {
		if (message instanceof UnitHasDiedMessage) {
		}
	};
}
