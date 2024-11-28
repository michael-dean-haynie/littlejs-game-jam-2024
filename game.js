/*
    Little JS Hello World Demo
    - Just prints "Hello World!"
    - A good starting point for new projects
*/

'use strict';

const levelSize = vec2(38, 20); // size of play area
let paddle; // keep track of paddle object
let ball; // keep track of ball object
let score = 0; // start score at 0

const sound_bounce = new Sound([,,1e3,,.03,.02,1,2,,,940,.03,,,,,.2,.6,,.06], 0);
const sound_break = new Sound([,,90,,.01,.03,4,,,,,,,9,50,.2,,.2,.01], 0);
const sound_start = new Sound([,0,500,,.04,.3,1,2,,,570,.02,.02,,,,.04]);

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // create bricks
    for (let x = 2; x <= levelSize.x - 2; x += 2) {
        for (let y = 12; y <= levelSize.y - 2; y += 1) {
            const brick = new Brick(vec2(x,y), vec2(2,1)); // create a brick
            brick.color = randColor(); // give brick a random color
        }
    }

    setCanvasFixedSize(vec2(1280, 720)); // use a 720p fixed size canvas
    setCameraPos(levelSize.scale(.5));

    paddle = new Paddle();

    // create walls
    new Wall(vec2(-.5,levelSize.y/2),            vec2(1,100)) // left
    new Wall(vec2(levelSize.x+.5,levelSize.y/2), vec2(1,100)) // right
    new Wall(vec2(levelSize.x/2,levelSize.y+.5), vec2(100,1)) // top
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    // called every frame at 60 frames per second
    // handle input and update the game state
    if (ball && ball.pos.y < -1) // if ball is below level
    {
        // destroy old ball
        ball.destroy();
        ball = 0;
    }
    if (!ball && mouseWasPressed(0)) // if there is no ball and left mouse is pressed
    {
        ball = new Ball(cameraPos); // create the ball
        sound_start.play(); // play start sound
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    // called after physics and objects are updated
    // setup camera and prepare for render
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    // called before objects are rendered
    // draw any background effects that appear behind objects
    drawRect(cameraPos, vec2(100), new Color(.5,.5,.5)); // draw background
    drawRect(cameraPos, levelSize, new Color(.1,.1,.1)); // draw level boundary
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // called after objects are rendered
    // draw effects or hud that appear above all objects
    drawTextScreen("Score " + score, vec2(mainCanvasSize.x/2, 70), 50); // show score
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);

class Paddle extends EngineObject {
    constructor() {
        super(vec2(0, 1), vec2(6, .5)) // set object position and size
        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
    }

    update() {
        this.pos.x = mousePos.x;

        // clamp paddle to level size
        this.pos.x = clamp(this.pos.x, this.size.x/2, levelSize.x - this.size.x/2);
    }
}

class Ball extends EngineObject {
    constructor(pos) {
        super(pos, vec2(.5)); // set object position and size
        this.setCollision(); // make object collide
        this.elasticity = 1; // make object bounce
        this.velocity = vec2(-.1, -.1); // give ball some movement
    }

    collideWithObject(o)
    {
        // prevent colliding with paddle if moving upwards
        if (o == paddle && this.velocity.y > 0) {
            return false;
        }

        if (o == paddle)
        {
            // control bounce angle when ball collides with paddle
            const deltaX = this.pos.x - o.pos.x;
            this.velocity = this.velocity.rotate(.3 * deltaX);

            // speed up the ball
            const speed = min(1.04*this.velocity.length(), .5);
            sound_bounce.play(this.pos, 1, speed); // play bounce sound with pitch scaled by speed
            this.velocity = this.velocity.normalize(speed); 
            
            // make sure ball is moving upwards with a minimum speed
            this.velocity.y = max(-this.velocity.y, .2);

            
            // prevent default collision code
            return false;
        }

        return true; // allow object to collide
    }
}

class Wall extends EngineObject {
    constructor(pos, size) {
        super(pos, size) // set object position and size
        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
        this.color = new Color(0,0,0,0); // make object invisible
    }
}

class Brick extends EngineObject
{
    constructor(pos, size)
    {
        super(pos, size);
        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
    }

    collideWithObject(o)
    {
        // create explosion effect
        const color = this.color;
        new ParticleEmitter(
            this.pos, 0,            // pos, angle
            this.size, .1, 200, PI, // emitSize, emitTime, emitRate, emiteCone
            undefined,              // tileInfo
            color, color,           // colorStartA, colorStartB
            color.scale(1,0), color.scale(1,0), // colorEndA, colorEndB
            .2, .5, 1, .1, .1,  // time, sizeStart, sizeEnd, speed, angleSpeed
            .99, .95, .4, PI,   // damping, angleDamping, gravityScale, cone
            .1, .5, false, true // fadeRate, randomness, collide, additive
        );

        score++; // award a point for each brick broke
        sound_break.play(this.pos); // play brick break sound
        this.destroy(); // destroy block when hit
        return true; // allow object to colide
    }
}