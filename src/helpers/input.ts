import {
	keyIsDown,
	keyWasPressed,
	keyWasReleased,
	mouseWasPressed,
} from "littlejsengine";
import type { MessageBroker } from "../message-broker";
import { IssueOrderMessage } from "../messages/issue-order-message";
import { AttackOrder } from "../orders/attack-order";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import { StopMovingOrder } from "../orders/stop-moving-order";

export class InputHelper {
	constructor(private readonly _messageBroker: MessageBroker) {
		this.stack = [];
	}

	private stack: Direction[];

	/** the current direction based off of user input */
	get currentDirection(): Direction | null {
		return this.stack.at(-1) ?? null;
	}

	update(): void {
		this.handleMovementInput();

		// attack
		if (mouseWasPressed(0)) {
			this._messageBroker.publish(
				new IssueOrderMessage({
					order: new AttackOrder(),
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

export const Directions = ["up", "left", "down", "right"] as const;
export type Direction = (typeof Directions)[number];

export function IsDirection(value: string | null): value is Direction {
	return Directions.includes(value as Direction);
}
