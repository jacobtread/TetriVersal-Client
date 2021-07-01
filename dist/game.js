"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixi_js_1 = require("pixi.js");
const net_1 = require("./net");
const renderer_1 = require("./renderer");
const screens_1 = require("./screens");
const utils_1 = require("./utils");
class Game {
    constructor() {
        this.app = new pixi_js_1.Application({ antialias: true });
        this.net = new net_1.NetworkClient();
        this.renderer = new renderer_1.Renderer();
        this.players = {};
        this.self = { uuid: '', name: '' };
        this.controlling = false;
        this.controller = { uuid: '', name: '' };
        this.score = 0;
    }
    init() {
        this.initNet();
    }
    load() {
        const renderer = this.app.renderer;
        renderer.view.style.display = "block";
        renderer.view.style.margin = "0 auto";
        this.renderer.resizeMap(12, 22); // Default map size
        window.onresize = () => this.sizeToRenderer();
        this.sizeToRenderer();
        this.app.stage.addChild(this.renderer);
        document.getElementById('gameCanvas')
            .appendChild(this.app.view);
        window.onkeypress = event => this.input(event.key);
    }
    reset() {
        this.score = 0;
        this.controller = { uuid: '', name: '' };
        this.controlling = false;
        this.net.removeAllListeners();
        this.load();
    }
    initNet() {
        this.net.on('connected', () => screens_1.Screen.set('join'));
        this.net.on('joined', (uuid) => {
            this.self.uuid = uuid;
            this.players[uuid] = this.self;
            this.refreshPlayerList();
            screens_1.Screen.set('pregame');
        });
        this.net.on('controlling', (controlling) => {
            this.controlling = controlling;
            this.controller = utils_1.clone(this.self);
        });
        this.net.on('controller', (uuid, name) => {
            this.controller.uuid = uuid;
            this.controller.name = name;
        });
        this.net.on('starting-in', (time) => {
            screens_1.Screen.setData('pregame', 'time', time);
        });
        this.net.on('disconnected', (reason) => {
            console.log('Disconnected: ' + reason);
        });
        this.net.on('game-over', () => {
            screens_1.Screen.set('pregame');
        });
        this.net.on('player-join', (name, uuid) => {
            this.players[uuid] = { uuid, name };
            this.refreshPlayerList();
        });
        this.net.on('player-leave', (name, uuid) => {
            delete this.players[uuid];
            this.refreshPlayerList();
        });
        this.net.on('started', () => {
            screens_1.Screen.set('game');
            this.load();
        });
        this.net.on('map-size', (width, height) => {
            this.renderer.resizeMap(width, height);
            this.sizeToRenderer();
        });
        this.net.on('bulk-data', (lines) => {
            this.renderer.parseBulkData(lines);
        });
        this.net.on('active-pos', (x, y) => {
            this.renderer.setActivePosition(x, y);
        });
        this.net.on('active-tiles', (tiles) => {
            this.renderer.setActiveTiles(tiles);
        });
        this.net.on('next-tiles', (tiles) => {
        });
        this.net.on('other-piece', (uuid, x, y, tiles) => {
            this.renderer.setOther(uuid, x, y, tiles);
        });
        this.net.on('score', (score) => {
            this.score = score;
        });
        this.net.on('rotate', () => {
            this.renderer.rotateTiles();
        });
    }
    sizeToRenderer() {
        this.renderer.resizeScreen();
        const { width, height } = this.renderer.size();
        this.app.renderer.resize(width, height);
    }
    input(key) {
        const keyStroke = (key) => {
            this.net._send({
                id: 2,
                key
            });
        };
        switch (key) {
            case 'left':
            case 'a':
                keyStroke('left');
                break;
            case 'right':
            case 'd':
                keyStroke('right');
                break;
            case 'up':
            case 'w':
            case 'r':
                keyStroke('rotate');
                break;
            case 'down':
            case 's':
                keyStroke('down');
                break;
        }
    }
    join(name) {
        this.self.name = name;
        this.net._send({ id: 1, name });
    }
    connect(host) {
        this.net.connect(host);
    }
    refreshPlayerList() {
        const listElement = document.getElementById('players');
        listElement.childNodes.forEach(it => it.remove());
        for (let uuid of Object.keys(this.players)) {
            const player = this.players[uuid];
            const element = screens_1.createFromTemplate('playerListTemplate', player);
            listElement.appendChild(element);
        }
    }
    vote(mode) {
        this.net._send({ id: 4, mode });
    }
}
const GAME = new Game();
GAME.init();
document.querySelectorAll('.server').forEach(element => {
    element.onclick = () => {
        const address = element.getAttribute('data-address');
        const port = parseInt(element.getAttribute('data-port'));
        GAME.connect(`ws://${address}:${port}`);
    };
});
document.querySelectorAll('.vote__button').forEach(element => {
    element.onclick = () => {
        const value = parseInt(element.getAttribute('data-value'));
        GAME.vote(value);
    };
});
document.getElementById('joinButton').onclick = () => {
    const nameInput = document.getElementById('name');
    const name = nameInput.value;
    GAME.join(name);
};
//# sourceMappingURL=game.js.map