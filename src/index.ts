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
import { ObstacleEngineObject } from "./engine-objects/obstacle-engine-object";
import { PlayerObstacleEngineObject } from "./engine-objects/player-obstacle-engine-object";
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

	// TODO: remove
	const mapEdge1 = new PlayerObstacleEngineObject(vec2(60, 40), vec2(1, 1));
	const mapEdge2 = new PlayerObstacleEngineObject(vec2(59, 40), vec2(1, 1));
	const mapEdge3 = new PlayerObstacleEngineObject(vec2(58, 40), vec2(1, 1));
	const mapEdge4 = new PlayerObstacleEngineObject(vec2(57, 40), vec2(1, 1));
	const mapEdge5 = new PlayerObstacleEngineObject(vec2(56, 40), vec2(1, 1));
	const mapEdge6 = new PlayerObstacleEngineObject(vec2(55, 40), vec2(1, 1));
	const mapEdge7 = new PlayerObstacleEngineObject(vec2(54, 40), vec2(1, 1));
	const mapEdge8 = new PlayerObstacleEngineObject(vec2(53, 40), vec2(1, 1));

	const obstacle1 = new ObstacleEngineObject(vec2(50, 38), vec2(1, 1));
	const obstacle2 = new ObstacleEngineObject(vec2(49, 38), vec2(1, 1));
	const obstacle3 = new ObstacleEngineObject(vec2(48, 38), vec2(1, 1));
	const obstacle4 = new ObstacleEngineObject(vec2(47, 38), vec2(1, 1));
	const obstacle5 = new ObstacleEngineObject(vec2(46, 38), vec2(1, 1));
	const obstacle6 = new ObstacleEngineObject(vec2(45, 38), vec2(1, 1));
	const obstacle7 = new ObstacleEngineObject(vec2(44, 38), vec2(1, 1));
	const obstacle8 = new ObstacleEngineObject(vec2(43, 38), vec2(1, 1));
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
