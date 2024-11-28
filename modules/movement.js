import * as LJS from '../node_modules/littlejsengine/dist/littlejs.esm.js';

/**
 * Tracks player intput to maintain a 'currentDirection' value.
 */
export class MovementHelper {
    constructor() {
        this.#stack = [Direction.None];
    }

    #stack;

    /** the current direction based off of user input */
    get currentDirection() {
        return this.#stack.at(-1);
    }

    /** detects user input to update the current direction */
    update() {
        // NOTE: WASD also auto-maps to arrow keys

        // key was pressed
        if (LJS.keyWasPressed("ArrowUp")) {
            this.#tryPush(Direction.Up);
        }
        if (LJS.keyIsDown("ArrowLeft")) {
            this.#tryPush(Direction.Left);
        }
        if (LJS.keyIsDown("ArrowDown")) {
            this.#tryPush(Direction.Down);
        }
        if (LJS.keyIsDown("ArrowRight")) {
            this.#tryPush(Direction.Right);
        }

        // key was released
        if (LJS.keyWasReleased("ArrowUp")) {
            this.#stack = this.#stack.filter(dir => dir !== Direction.Up);
        }
        if (LJS.keyWasReleased("ArrowLeft")) {
            this.#stack = this.#stack.filter(dir => dir !== Direction.Left);
        }
        if (LJS.keyWasReleased("ArrowDown")) {
            this.#stack = this.#stack.filter(dir => dir !== Direction.Down);
        }
        if (LJS.keyWasReleased("ArrowRight")) {
            this.#stack = this.#stack.filter(dir => dir !== Direction.Right);
        }
    }

    /** adds direction to the stack if it is not already there */
    #tryPush(direction) {
        if (!this.#stack.includes(direction)) {
            this.#stack.push(direction);
        }
    }

}

export const Direction = Object.freeze({
    None: 'None',
    Up: 'Up',
    Left: 'Left',
    Down: 'Down',
    Right: 'Right'
});