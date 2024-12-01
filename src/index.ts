import {
	engineInit,
	engineObjects,
	mousePos,
	mouseWasPressed,
	setCameraPos,
	vec2,
} from "littlejsengine";
import { ActorMessageBroker } from "./actor-message-broker";
import { Runner } from "./engine-objects/runner";
import type { Target } from "./engine-objects/target";
import { PathingHelper } from "./helpers/pathing";

// globals
const worldSize = vec2(100, 100);
const centerOfWorld = worldSize.scale(0.5);
const astarNodeSize = 1;
const pathingHelper = new PathingHelper(worldSize, astarNodeSize);
const actorMessageBroker = new ActorMessageBroker();

let target: Target;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	setCameraPos(centerOfWorld);
	// target = new Target(centerOfWorld, vec2(1, 1));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
	// // create runner
	// if (mouseWasPressed(0)) {
	// 	const runner = new Runner(mousePos, vec2(1, 1));
	// 	const path = pathingHelper.getPath(runner.pos, target.pos);
	// 	for (const engineObject of engineObjects) {
	// 		// console.log(engineObject instanceof EngineObject);
	// 	}
	// }

	// // create target
	// if (mouseWasPressed(2)) {
	// 	if (target) {
	// 		target.destroy();
	// 	}
	// 	target = new Target(mousePos, vec2(1, 1));
	// }

	// update actors
	actorMessageBroker.update();
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
