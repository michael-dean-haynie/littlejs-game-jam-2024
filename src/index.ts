import {
	type Vector2,
	cameraScale,
	drawTile,
	engineInit,
	getCameraSize,
	setCameraPos,
	setCameraScale,
	setCanvasFixedSize,
	setObjectDefaultDamping,
	setObjectDefaultElasticity,
	setObjectDefaultFriction,
	setShowSplashScreen,
	tile,
	vec2,
} from "littlejsengine";
import PerlinSimplex from "perlin-simplex";
import { createNoise2D } from "simplex-noise";
import { ObstacleEngineObject } from "./engine-objects/obstacle-engine-object";
import { PlayerObstacleEngineObject } from "./engine-objects/player-obstacle-engine-object";
import type { Target } from "./engine-objects/target";
import { InputHelper } from "./helpers/input";
import { PathingHelper } from "./helpers/pathing";
import { MessageBroker } from "./message-broker";

setShowSplashScreen(true);

// globals
const canvasSize = vec2(1280, 720); // use a 720p fixed size canvas
const astarNodeSize = 1; // relative to world units
let worldSize: Vector2;
let centerOfWorld: Vector2;
let pathingHelper: PathingHelper;
let messageBroker: MessageBroker;
let inputHelper: InputHelper;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	worldSize = canvasSize.divide(vec2(cameraScale));
	centerOfWorld = worldSize.scale(0.5);
	pathingHelper = new PathingHelper(worldSize, astarNodeSize);
	messageBroker = new MessageBroker(pathingHelper);
	inputHelper = new InputHelper(messageBroker);

	setCanvasFixedSize(canvasSize);
	setCameraPos(centerOfWorld);

	setObjectDefaultDamping(0.9);
	// setObjectDefaultFriction(0);
	// setObjectDefaultElasticity(1);

	// install player obstacles at world edges
	const left = new PlayerObstacleEngineObject(
		vec2(-0.5, worldSize.y / 2),
		vec2(1, worldSize.y),
	);
	const right = new PlayerObstacleEngineObject(
		vec2(worldSize.x + 0.5, worldSize.y / 2),
		vec2(1, worldSize.y),
	);
	const top = new PlayerObstacleEngineObject(
		vec2(worldSize.x / 2, worldSize.y + 0.5),
		vec2(worldSize.x, 1),
	);
	const bottom = new PlayerObstacleEngineObject(
		vec2(worldSize.x / 2, -0.5),
		vec2(worldSize.x, 1),
	);

	// TODO: remove
	// const mapEdge1 = new PlayerObstacleEngineObject(vec2(60, 40), vec2(1, 1));
	// const mapEdge2 = new PlayerObstacleEngineObject(vec2(59, 40), vec2(1, 1));
	// const mapEdge3 = new PlayerObstacleEngineObject(vec2(58, 40), vec2(1, 1));
	// const mapEdge4 = new PlayerObstacleEngineObject(vec2(57, 40), vec2(1, 1));
	// const mapEdge5 = new PlayerObstacleEngineObject(vec2(56, 40), vec2(1, 1));
	// const mapEdge6 = new PlayerObstacleEngineObject(vec2(55, 40), vec2(1, 1));
	// const mapEdge7 = new PlayerObstacleEngineObject(vec2(54, 40), vec2(1, 1));
	// const mapEdge8 = new PlayerObstacleEngineObject(vec2(53, 40), vec2(1, 1));

	// const obstacle1 = new ObstacleEngineObject(vec2(50, 38), vec2(1, 1));
	// const obstacle2 = new ObstacleEngineObject(vec2(49, 38), vec2(1, 1));
	// const obstacle3 = new ObstacleEngineObject(vec2(48, 38), vec2(1, 1));
	// const obstacle4 = new ObstacleEngineObject(vec2(47, 38), vec2(1, 1));
	// const obstacle5 = new ObstacleEngineObject(vec2(46, 38), vec2(1, 1));
	// const obstacle6 = new ObstacleEngineObject(vec2(45, 38), vec2(1, 1));
	// const obstacle7 = new ObstacleEngineObject(vec2(44, 38), vec2(1, 1));
	// const obstacle8 = new ObstacleEngineObject(vec2(43, 38), vec2(1, 1));

	// TRYING OUT SIMPLEX NOISE
	const noise2d = createNoise2D();
	for (let x = 0; x < worldSize.x; x++) {
		for (let y = 0; y < worldSize.y; y++) {
			// console.log(`(${x},${y}): ${noise2d(x, y)}`);
			const value = noise2d(x, y);
			if (value > 0.75) {
				const obstacle = new ObstacleEngineObject(vec2(x, y), vec2(1, 1));
			}
		}
	}
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
