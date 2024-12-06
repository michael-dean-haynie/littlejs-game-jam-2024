import {
	type Vector2,
	cameraScale,
	engineInit,
	setCameraPos,
	setCanvasFixedSize,
	setObjectDefaultDamping,
	setShowSplashScreen,
	vec2,
} from "littlejsengine";
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
let arenaSize: Vector2;
let spawnAreaSize: number;
let worldSize: Vector2;
let worldCenter: Vector2;
let pathingHelper: PathingHelper;
let messageBroker: MessageBroker;
let inputHelper: InputHelper;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	arenaSize = canvasSize.divide(vec2(cameraScale)); // the size of the area where player can move
	spawnAreaSize = 5; // note, spawning enemies should be 1 less because world barrier will take up 1 spot
	const worldSizeX = Math.ceil(arenaSize.x + spawnAreaSize * 2);
	const worldSizeY = Math.ceil(arenaSize.y + spawnAreaSize * 2);
	worldSize = vec2(worldSizeX, worldSizeY);
	worldCenter = worldSize.scale(0.5);
	pathingHelper = new PathingHelper(
		worldSize,
		arenaSize,
		spawnAreaSize,
		worldCenter,
		astarNodeSize,
	);
	messageBroker = new MessageBroker(pathingHelper);
	inputHelper = new InputHelper(messageBroker);

	setCanvasFixedSize(canvasSize);
	setCameraPos(worldCenter);

	setObjectDefaultDamping(0.9);
	// setObjectDefaultFriction(0);
	// setObjectDefaultElasticity(1);

	// install player obstacles at arena edges (just outside of arena size)
	const left = new PlayerObstacleEngineObject(
		vec2(worldCenter.x - arenaSize.x / 2 - 0.5, worldSize.y / 2),
		vec2(1, arenaSize.y),
	);
	const right = new PlayerObstacleEngineObject(
		vec2(worldCenter.x + arenaSize.x / 2 + 0.5, worldSize.y / 2),
		vec2(1, arenaSize.y),
	);
	const top = new PlayerObstacleEngineObject(
		vec2(worldSize.x / 2, worldCenter.y + arenaSize.y / 2 + 0.5),
		vec2(arenaSize.x, 1),
	);
	const bottom = new PlayerObstacleEngineObject(
		vec2(worldSize.x / 2, worldCenter.y - arenaSize.y / 2 - 0.5),
		vec2(arenaSize.x, 1),
	);

	// install obstacles at world edges (taking up 1 space just inside world size because barriers need registered by astar pathing grid)
	const wLeft = new ObstacleEngineObject(
		false,
		vec2(0.5, worldSize.y / 2),
		vec2(1, worldSize.y),
	);
	const wRight = new ObstacleEngineObject(
		false,
		vec2(worldSize.x - 0.5, worldSize.y / 2),
		vec2(1, worldSize.y),
	);
	const wTop = new ObstacleEngineObject(
		false,
		vec2(worldSize.x / 2, worldSize.y - 0.5),
		vec2(worldSize.x, 1),
	);
	const wBottom = new ObstacleEngineObject(
		false,
		vec2(worldSize.x / 2, 0.5),
		vec2(worldSize.x, 1),
	);

	// TRYING OUT SIMPLEX NOISE
	const noise2d = createNoise2D();
	for (let x = 0; x < worldSize.x; x++) {
		for (let y = 0; y < worldSize.y; y++) {
			// console.log(`(${x},${y}): ${noise2d(x, y)}`);
			const value = noise2d(x, y);
			if (value > 0.75) {
				const obstacle = new ObstacleEngineObject(true, vec2(x, y), vec2(1, 1));
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
