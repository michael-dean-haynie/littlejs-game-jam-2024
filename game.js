'use strict';

import { Direction, MovementHelper } from './modules/movement.js';
import * as LJS from './node_modules/littlejsengine/dist/littlejs.esm.js';
const {
    EngineObject,
    vec2,
} = LJS;

// show the LittleJS splash screen
// LittleJS.setShowSplashScreen(true);

// sound effects
// const sound_click = new LittleJS.Sound([1,.5]);

// medals
// const medal_example = new LittleJS.Medal(0, 'Example Medal', 'Welcome to LittleJS!');
// LittleJS.medalsInit('Hello World');

// game variables
// let particleEmitter;

// globals
const worldSize = new vec2(100, 100);
const movementHelper = new MovementHelper();

let engineObject;

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    engineObject = new EngineObject(vec2(0 ,0), vec2(1, 1));
    engineObject.color = LJS.randColor();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if (LJS.mouseWasPressed(0)) {
        engineObject.color = LJS.randColor()
    }

    // process player input as movement
    movementHelper.update();
    if (movementHelper.currentDirection === Direction.Up) {
        engineObject.velocity = vec2(0, .1);
    }
    if (movementHelper.currentDirection === Direction.Left) {
        engineObject.velocity = vec2(-.1, 0);
    }
    if (movementHelper.currentDirection === Direction.Down) {
        engineObject.velocity = vec2(0, -.1);
    }
    if (movementHelper.currentDirection === Direction.Right) {
        engineObject.velocity = vec2(.1, 0);
    }
    if (movementHelper.currentDirection === Direction.None) {
        engineObject.velocity = vec2(0, 0);
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
LJS.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);