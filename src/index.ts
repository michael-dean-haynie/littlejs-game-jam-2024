import {
	EngineObject,
	engineInit,
	gravity,
	mouseWasPressed,
	randColor,
	setGravity,
	vec2,
} from "littlejsengine";
import { Avatar } from "./engine-objects/avatar";
import { Block } from "./engine-objects/block";
import { MovementHelper } from "./helpers/movement";

// globals
const worldSize = vec2(100, 100);

let avatar: Avatar;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	avatar = new Avatar(vec2(0, 0), vec2(1, 1));
	avatar.color = randColor();

	const block = new Block(vec2(1, 1), vec2(1, 1));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
	if (mouseWasPressed(0)) {
		avatar.color = randColor();
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
