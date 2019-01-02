const WebSocket = require('ws');
const WIDTH = 600;
const HEIGHT = 600;
const CELL_SIZE = 10;

let players = [];

class Snake
{
    // 0 - up, 1 - down, 2 - left, 3 - right
    constructor(uid, x, y, body, direction=0, ws=null) {
        this.uid = uid;
        this.x = x;
        this.y = y;
        this.body = body;
        this.direction = direction;
        this.ws = ws;
    }

    move() {
        let direction = this.direction;
        this.body.pop();
        switch (direction) {
            case 0:
                this.y--;
                direction = 1;
                break;
            case 1:
                this.y++;
                direction = 0;
                break;
            case 2:
                this.x--;
                direction = 3;
                break;
            case 3:
                this.x++;
                direction = 2;
                break;
        }
        this.body.unshift(direction);
    }
}

class Food
{
    constructor() {
        this.x = -1;
        this.y = -1;
        this.moveToRandom();
    }

    moveToRandom() {
        this.x = Math.round((Math.random() * WIDTH % WIDTH) / CELL_SIZE)
        this.y = Math.round((Math.random() * HEIGHT % HEIGHT) / CELL_SIZE)
    }
}

function sendFoodData(ws) {
    ws.send(JSON.stringify({
        'command': 'update_food',
        'food_x': food.x,
        'food_y': food.y
    }));
}

let food = new Food();

const wss = new WebSocket.Server({
    port: 8080,
});

wss.on('connection', function (ws) {
    let player = new Snake(1, 3, 5, [1, 1, 1], 0, ws);
    players.push(player);
    let id = players.length - 1;
    sendFoodData(player.ws);

    ws.on('message', function (message) {
        player.direction = parseInt(message);
    });

    ws.on('close', function () {
    });
});

let serverTick = setInterval(function () {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        sendFoodData(player.ws);

        player.move();

        if (player.x === food.x && player.y === food.y) {
            player.body.push(player.body[player.body.length]);
            food.moveToRandom();
        }

        if (player.ws) {
            let snakesData = [];
            for (let i = 0; i < players.length; i++) {
                let player = players[i];
                snakesData.push({
                    'id': i,
                    'x': player.x,
                    'y': player.y,
                    'body': player.body
                });
            }

            player.ws.send(JSON.stringify({
                'command': 'update_snakes',
                'snakes': snakesData
            }));
        }
    }
}, 200);

console.log('Server ready!');
