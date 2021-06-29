import {Application} from "pixi.js";
import {NetworkClient} from "./net";
import {Renderer} from "./renderer";
import {createFromTemplate, Screen} from "./screens";
import {clone} from "./utils";

interface PlayerList {
    [uuid: string]: Player
}

type Player = { uuid: string, name: string };

class Game {

    app: Application = new Application({antialias: true});
    net: NetworkClient = new NetworkClient();
    renderer: Renderer = new Renderer();
    players: PlayerList = {}
    self: Player = {uuid: '', name: ''};
    controlling: boolean = false;
    controller: Player = {uuid: '', name: ''};
    score: number = 0;

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
        this.controller = {uuid: '', name: ''}
        this.controlling = false;
        this.net.removeAllListeners()
        this.load();
    }

    initNet() {
        this.net.on('connected', () => Screen.set('join'));
        this.net.on('joined', (uuid: string) => {
            this.self.uuid = uuid;
            this.players[uuid] = this.self;
            this.refreshPlayerList();
            Screen.set('pregame');
        });
        this.net.on('controlling', (controlling: boolean) => {
            this.controlling = controlling;
            this.controller = clone(this.self);
        });
        this.net.on('controller', (uuid: string, name: string) => {
            this.controller.uuid = uuid;
            this.controller.name = name;
        });
        this.net.on('starting-in', (time: number) => {
            Screen.setData('pregame', 'time', time);
        });
        this.net.on('disconnected', (reason: string) => {
            console.log('Disconnected: ' + reason);
        });
        this.net.on('game-over', () => {
            Screen.set('pregame');
        });
        this.net.on('player-join', (name: string, uuid: string) => {
            this.players[uuid] = {uuid, name};
            this.refreshPlayerList();
        });
        this.net.on('player-leave', (name: string, uuid: string) => {
            delete this.players[uuid];
            this.refreshPlayerList();
        });
        this.net.on('started', () => {
            Screen.set('game');
            this.load();
        });
        this.net.on('map-size', (width: number, height: number) => {
            this.renderer.resizeMap(width, height);
            this.sizeToRenderer();
        });
        this.net.on('bulk-data', (lines: string[]) => {
            this.renderer.parseBulkData(lines);
        });
        this.net.on('active-pos', (x: number, y: number) => {
            this.renderer.setActivePosition(x, y);
        });
        this.net.on('active-tiles', (tiles: number[][]) => {
            this.renderer.setActiveTiles(tiles);
        });
        this.net.on('next-tiles', (tiles: number[][]) => {

        });
        this.net.on('other-piece', (uuid: string, x: number, y: number, tiles: number[][]) => {
            this.renderer.setOther(uuid, x, y, tiles);
        });
        this.net.on('score', (score: number) => {
            this.score = score;
        });
        this.net.on('rotate', () => {
            this.renderer.rotateTiles();
        })
    }

    sizeToRenderer() {
        this.renderer.resizeScreen();
        const {width, height} = this.renderer.size();
        this.app.renderer.resize(width, height)
    }

    input(key) {
        const keyStroke = (key: string) => {
            this.net._send({
                id: 2,
                key
            })
        }

        switch (key) {
            case 'left':
            case 'a':
                keyStroke('left')
                break;
            case 'right':
            case 'd':
                keyStroke('right')
                break;
            case 'up':
            case 'w':
            case 'r':
                keyStroke('rotate');
                break;
            case 'down':
            case 's':
                keyStroke('down')
                break;

        }
    }

    join(name: string) {
        this.self.name = name;
        this.net._send({id: 1, name})
    }

    connect(host: string) {
        this.net.connect(host);
    }

    refreshPlayerList() {
        const listElement = document.getElementById('players');
        listElement.childNodes.forEach(it => it.remove());
        for (let uuid of Object.keys(this.players)) {
            const player: Player = this.players[uuid];
            const element = createFromTemplate('playerListTemplate', player);
            listElement.appendChild(element)
        }
    }

    vote(mode: number) {
        this.net._send({id: 4, mode});
    }

}

const GAME = new Game();
GAME.init();

document.querySelectorAll('.server').forEach(element => {
    (element as HTMLElement).onclick = () => {
        const address = element.getAttribute('data-address')
        const port = parseInt(element.getAttribute('data-port'))
        GAME.connect(`ws://${address}:${port}`);
    }
});

document.querySelectorAll('.vote__button').forEach(element => {
    (element as HTMLElement).onclick = () => {
        const value = parseInt(element.getAttribute('data-value'))
        GAME.vote(value);
    }
});
document.getElementById('joinButton').onclick = () => {
    const nameInput: HTMLInputElement = document.getElementById('name') as HTMLInputElement;
    const name: string = nameInput.value;
    GAME.join(name);
}
