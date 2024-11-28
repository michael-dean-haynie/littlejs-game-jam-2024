'use strict';

import { helloWorld } from './modules/example.js';
import * as LittleJS from './node_modules/littlejsengine/dist/littlejs.esm.js';
const { vec2 } = LittleJS;

// show the LittleJS splash screen
// LittleJS.setShowSplashScreen(true);

// sound effects
// const sound_click = new LittleJS.Sound([1,.5]);

// medals
// const medal_example = new LittleJS.Medal(0, 'Example Medal', 'Welcome to LittleJS!');
// LittleJS.medalsInit('Hello World');

// game variables
// let particleEmitter;

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    helloWorld();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
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
LittleJS.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);