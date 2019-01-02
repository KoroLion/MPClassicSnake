'use strict;';

const WIDTH = 600;
const HEIGHT = 600;
const CELL_SIZE = 10;

let ws = new WebSocket('ws://localhost:8080');

let snakes = [];

ws.addEventListener('open', function (e) {
    console.log('Connected to server!');

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 87) {
            ws.send(0);
        }
        if (e.keyCode === 83) {
            ws.send(1);
        }
        if (e.keyCode === 65) {
            ws.send(2);
        }
        if (e.keyCode === 68) {
            ws.send(3);
        }
    });
});

ws.addEventListener('message', function (e) {
    let data = JSON.parse(e.data);

    if (data.command === 'update_snakes') {
        for (let i = 0; i < data.snakes.length; i++) {
            if (!snakes[i] && data.snakes[i]) {
                snakes[i] = new Snake();
            }

            let snake = snakes[i];
            let dataSnake = data.snakes[i];

            snake.x = dataSnake.x;
            snake.y = dataSnake.y;
            snake.body = dataSnake.body;
        }
    } else if (data.command === 'update_food') {
        food.x = data.food_x;
        food.y = data.food_y;
    }
});

function drawGrid(ctx) {
    ctx.fillStyle = '#AAA';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey";
    for (let i = CELL_SIZE + 0.5; i < WIDTH; i += CELL_SIZE) {
        ctx.moveTo(0, i);
        ctx.lineTo(WIDTH, i);
    }
    for (let i = CELL_SIZE + 0.5; i < HEIGHT; i += CELL_SIZE) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, HEIGHT);
    }
    ctx.stroke();
}

function placeBlock(ctx, x, y) {
    ctx.fillRect(
        x * CELL_SIZE + 1 - CELL_SIZE, y * CELL_SIZE + 1 - CELL_SIZE,
        CELL_SIZE - 1, CELL_SIZE - 1
    );
}

class Snake
{
    // 0 - up, 1 - down, 2 - left, 3 - right
    constructor(x=0, y=0, body=[]) {
        this.x = x;
        this.y = y;
        this.body = body;
    }

    render(ctx) {
        ctx.fillStyle = 'orange';
        placeBlock(ctx, this.x, this.y);

        let x = this.x, y = this.y;
        ctx.fillStyle = 'green';
        for (let i = 0; i < this.body.length; i++) {
            let part = this.body[i];
            switch (part) {
                case 0: y--; break;
                case 1: y++; break;
                case 2: x--; break;
                case 3: x++; break;
            }

            placeBlock(ctx, x, y);
        }
    }
}

class Food
{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    render(ctx) {
        ctx.fillStyle = 'red';
        placeBlock(ctx, this.x, this.y);
    }
}

let canvas = game;
canvas.setAttribute('width', WIDTH + 'px');
canvas.setAttribute('height', HEIGHT + 'px');

let ctx = canvas.getContext('2d');

let player = new Snake(3, 5, [1, 1, 1, 2, 2]);
let food = new Food(-1, -1);

function animate() {
    drawGrid(ctx);
    for (let i = 0; i < snakes.length; i++) {
        if (snakes[i]) {
            snakes[i].render(ctx);
        }
    }
    food.render(ctx);
}

animate();
let gameInterval = setInterval(animate, 200);
