import {
	keyIsDown,
	keyWasPressed,
	keyWasReleased,
	mouseWasPressed,
} from "littlejsengine";
import type { MessageBroker } from "../message-broker";
import { IssueOrderMessage } from "../messages/issue-order-message";
import { AttackInDirectionOrder } from "../orders/attack-order";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import { StopMovingOrder } from "../orders/stop-moving-order";
import { yeet } from "../utilities/utilities";

export class InputHelper {
	constructor(private readonly _messageBroker: MessageBroker) {
		this.stack = [];
	}

	private stack: Direction[];

	/** the current direction based off of user input */
	get currentDirection(): Direction | null {
		if (!this.stack.length) {
			return null;
		}

		const lastPressedDirection =
			this.stack.at(-1) ?? yeet("UNEXPECTED_NULLISH_VALUE");

		if (this.stack.length === 1) {
			return lastPressedDirection;
		}

		// check for combos
		for (let stackIdx = this.stack.length - 2; stackIdx >= 0; stackIdx--) {
			const potentialCombo = [lastPressedDirection, this.stack[stackIdx]];
			const comboDirection = getDirectionFromCombo(potentialCombo);
			if (comboDirection) {
				return comboDirection;
			}
		}

		// otherwise default to simply the last pressed direction
		return lastPressedDirection;
	}

	update(): void {
		this.handleMovementInput();

		// attack
		if (mouseWasPressed(0)) {
			this._messageBroker.publish(
				new IssueOrderMessage({
					order: new AttackInDirectionOrder(),
					orderedUnitId: this._messageBroker.playerActor.playerUnitId,
				}),
			);
		}
	}

	private handleMovementInput(): void {
		// NOTE: WASD also auto-maps to arrow keys

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
			this.stack = this.stack.filter((dir) => dir !== "up");
		}
		if (keyWasReleased("ArrowLeft")) {
			this.stack = this.stack.filter((dir) => dir !== "left");
		}
		if (keyWasReleased("ArrowDown")) {
			this.stack = this.stack.filter((dir) => dir !== "down");
		}
		if (keyWasReleased("ArrowRight")) {
			this.stack = this.stack.filter((dir) => dir !== "right");
		}

		if (this.currentDirection !== prevDirection) {
			if (!this.currentDirection) {
				this._messageBroker.publish(
					new IssueOrderMessage({
						order: new StopMovingOrder(),
						orderedUnitId: this._messageBroker.playerActor.playerUnitId,
					}),
				);
			} else {
				this._messageBroker.publish(
					new IssueOrderMessage({
						order: new MoveInDirectionOrder({
							direction: this.currentDirection,
						}),
						orderedUnitId: this._messageBroker.playerActor.playerUnitId,
					}),
				);
			}
		}
	}

	/** adds direction to the stack if it is not already there */
	private tryPush(direction: Direction): void {
		if (!this.stack.includes(direction)) {
			this.stack.push(direction);
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
