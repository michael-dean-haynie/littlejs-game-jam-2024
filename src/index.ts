import {
	drawTile,
	engineInit,
	setCameraPos,
	setObjectDefaultDamping,
	setObjectDefaultElasticity,
	setShowSplashScreen,
	tile,
	vec2,
} from "littlejsengine";
import type { Target } from "./engine-objects/target";
import { InputHelper } from "./helpers/input";
import { PathingHelper } from "./helpers/pathing";
import { MessageBroker } from "./message-broker";

setShowSplashScreen(true);

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
	setObjectDefaultDamping(0.9);
	// target = new Target(centerOfWorld, vec2(1, 1));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
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
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
	"tiles.png",
]);
