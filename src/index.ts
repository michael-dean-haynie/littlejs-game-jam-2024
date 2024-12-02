import { engineInit, setCameraPos, vec2 } from "littlejsengine";
import type { Target } from "./engine-objects/target";
import { InputHelper } from "./helpers/input";
import { PathingHelper } from "./helpers/pathing";
import { MessageBroker } from "./message-broker";

// globals
const worldSize = vec2(100, 100);
const centerOfWorld = worldSize.scale(0.5);
const astarNodeSize = 1;
const pathingHelper = new PathingHelper(worldSize, astarNodeSize);
const messageBroker = new MessageBroker(pathingHelper);
const inputHelper = new InputHelper(messageBroker);

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

	// update input
	inputHelper.update();

	// update actors
	messageBroker.update();
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
