import {
	keyIsDown,
	keyWasPressed,
	keyWasReleased,
	mouseWasPressed,
} from "littlejsengine";
import { IssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { AttackOrder } from "../orders/attack-order";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import { StopMovingOrder } from "../orders/stop-moving-order";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { UnitActor } from "./unit-actor";

export class InputActor extends Actor {
	constructor(...params: ConstructorParameters<typeof Actor>) {
		super(...params);
		this._stack = [];
	}

	protected handleMessage<T extends Message>(message: T): void {}

	private _stack: Direction[];

	private get currentDirection(): Direction | null {
		if (!this._stack.length) {
			return null;
		}

		const lastPressedDirection =
			this._stack.at(-1) ?? yeet("UNEXPECTED_NULLISH_VALUE");

		if (this._stack.length === 1) {
			return lastPressedDirection;
		}

		// check for combos
		for (let stackIdx = this._stack.length - 2; stackIdx >= 0; stackIdx--) {
			const potentialCombo = [lastPressedDirection, this._stack[stackIdx]];
			const comboDirection = getDirectionFromCombo(potentialCombo);
			if (comboDirection) {
				return comboDirection;
			}
		}

		// otherwise default to simply the last pressed direction
		return lastPressedDirection;
	}

	// overwrite super, not extend since this input actor should only publish messages, not receive
	update(): void {
		this.handleMovementInput();

		// attack
		if (mouseWasPressed(0)) {
			const playerUnitActorId =
				this.actorDirectory.getActorIdByAlias("playerUnitActor") ||
				yeet("UNEXPECTED_NULLISH_VALUE");

			this.messageBroker.publishMessage(
				new IssueOrderMessage(
					new AttackOrder(this.actorDirectory, this.messageBroker),
				),
				{ actorIds: [playerUnitActorId] },
			);
		}
	}

	private handleMovementInput(): void {
		// NOTE: WASD also auto-maps to arrow keys
		const playerUnitActorId =
			this.actorDirectory.getActorIdByAlias("playerUnitActor") ||
			yeet("UNEXPECTED_NULLISH_VALUE");

		const prevDirection = this.currentDirection;

		// key was pressed
		if (keyWasPressed("ArrowUp")) {
			this.tryPush("up");
		}
		if (keyIsDown("ArrowLeft")) {
			this.tryPush("left");
		}
		if (keyIsDown("ArrowDown")) {
			this.tryPush("down");
		}
		if (keyIsDown("ArrowRight")) {
			this.tryPush("right");
		}

		// key was released
		if (keyWasReleased("ArrowUp")) {
			this._stack = this._stack.filter((dir) => dir !== "up");
		}
		if (keyWasReleased("ArrowLeft")) {
			this._stack = this._stack.filter((dir) => dir !== "left");
		}
		if (keyWasReleased("ArrowDown")) {
			this._stack = this._stack.filter((dir) => dir !== "down");
		}
		if (keyWasReleased("ArrowRight")) {
			this._stack = this._stack.filter((dir) => dir !== "right");
		}

		if (this.currentDirection !== prevDirection) {
			if (!this.currentDirection) {
				this.messageBroker.publishMessage(
					new IssueOrderMessage(
						new StopMovingOrder(this.actorDirectory, this.messageBroker),
					),
					{ actorIds: [playerUnitActorId] },
				);
			} else {
				this.messageBroker.publishMessage(
					new IssueOrderMessage(
						new MoveInDirectionOrder(
							this.currentDirection,
							this.actorDirectory,
							this.messageBroker,
						),
					),
					{ actorIds: [playerUnitActorId] },
				);
			}
		}
	}

	/** adds direction to the stack if it is not already there */
	private tryPush(direction: Direction): void {
		if (!this._stack.includes(direction)) {
			this._stack.push(direction);
		}
	}
}

export const Directions = [
	"up",
	"left",
	"down",
	"right",
	"up left",
	"down left",
	"up right",
	"down right",
] as const;
export type Direction = (typeof Directions)[number];

export function IsDirection(value: string | null): value is Direction {
	return Directions.includes(value as Direction);
}

export type DirectionComboMap = {
	[K in Direction]?: Direction[];
};

export const DirectionCombos: DirectionComboMap = {
	"up left": ["up", "left"],
	"up right": ["up", "right"],
	"down left": ["down", "left"],
	"down right": ["down", "right"],
} as const;

export function getDirectionFromCombo(
	directions: Direction[],
): Direction | undefined {
	for (const [key, value] of Object.entries(DirectionCombos)) {
		if (directions.every((dir) => value.includes(dir))) {
			return key as Direction;
		}
	}
}
