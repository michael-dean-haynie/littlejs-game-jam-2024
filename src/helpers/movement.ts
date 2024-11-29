import { keyIsDown, keyWasPressed, keyWasReleased } from "littlejsengine";
import { yeet } from "../utilities/utilities";

/**
 * Tracks player input to maintain a 'currentDirection' value.
 */
export class MovementHelper {
	constructor() {
		this.stack = ["none"];
	}

	private stack: Direction[];

	/** the current direction based off of user input */
	get currentDirection(): Direction {
		return this.stack.at(-1) ?? yeet("UNEXPECTED_NULLISH_VALUE");
	}

	/** detects user input to update the current direction */
	update(): void {
		// NOTE: WASD also auto-maps to arrow keys

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
	}

	/** adds direction to the stack if it is not already there */
	private tryPush(direction: Direction): void {
		if (!this.stack.includes(direction)) {
			this.stack.push(direction);
		}
	}
}

export const Directions = ["none", "up", "left", "down", "right"] as const;
export type Direction = (typeof Directions)[number];

export function IsDirection(value: string | null): value is Direction {
	return Directions.includes(value as Direction);
}
