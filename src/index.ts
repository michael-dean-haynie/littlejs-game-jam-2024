import {
	EngineObject,
	engineInit,
	mouseWasPressed,
	randColor,
	vec2,
} from "littlejsengine";
import { MovementHelper } from "./helpers/movement";

// globals
const worldSize = vec2(100, 100);
const moveSpeed = 0.2;
const movementHelper = new MovementHelper();

let engineObject: EngineObject;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	engineObject = new EngineObject(vec2(0, 0), vec2(1, 1));
	engineObject.color = randColor();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
	if (mouseWasPressed(0)) {
		engineObject.color = randColor();
	}

	// process player input as movement
	movementHelper.update();
	if (movementHelper.currentDirection === "up") {
		engineObject.velocity = vec2(0, moveSpeed);
	}
	if (movementHelper.currentDirection === "left") {
		engineObject.velocity = vec2(moveSpeed * -1, 0);
	}
	if (movementHelper.currentDirection === "down") {
		engineObject.velocity = vec2(0, moveSpeed * -1);
	}
	if (movementHelper.currentDirection === "right") {
		engineObject.velocity = vec2(moveSpeed, 0);
	}
	if (movementHelper.currentDirection === "none") {
		engineObject.velocity = vec2(0, 0);
	}
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
