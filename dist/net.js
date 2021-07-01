"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkClient = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = __importDefault(require("events"));
class NetworkClient extends events_1.default {
    constructor() {
        super();
    }
    connect(host) {
        this.client = new ws_1.default(host);
        this.aliveTimeout = this.createTimeout();
        this.client.on('open', () => this.emit('connected'));
        this.client.on('message', data => {
            const packet = JSON.parse(data.toString());
            if (packet.hasOwnProperty("id")) {
                this.process(packet).then().catch();
            }
            else {
                // TODO: Bad packet handling
            }
        });
    }
    createTimeout() {
        return setTimeout(() => this.send({ id: 0 }) /* SEND KEEP ALIVE */, 500);
    }
    async send(packet) {
        this.client.send(JSON.stringify(packet));
        clearTimeout(this.aliveTimeout);
        this.aliveTimeout = this.createTimeout();
    }
    _send(packet) {
        this.send(packet).then().catch();
    }
    async process(packet) {
        const id = packet.id;
        switch (id) {
            case 0: // Server is alive
                this.emit('alive');
                break;
            case 1: // Joined the game
                this.emit('joined', packet.uuid);
                break;
            case 2: // Failed to join
            case 3: // Disconnected
                const reason = packet.reason;
                this.emit('disconnected', reason);
                break;
            case 4:
            case 5: // Player join
                const name = packet.name;
                const uuid = packet.uuid;
                if (id == 4)
                    this.emit('player-join', uuid, name);
                else
                    this.emit('player-leave', uuid, name);
                break;
            case 6:
                this.emit('started');
                break;
            case 7:
                const time = packet.time;
                this.emit('starting-in', time);
                break;
            case 8:
                this.emit('game-over');
                break;
            case 9: // Control packet
            case 10: // Other player controls
                this.emit('controlling', id == 9);
                if (id == 10) {
                    const uuid = packet.uuid;
                    const name = packet.name;
                    this.emit('controller', uuid, name);
                }
                break;
            case 11: // Bulk update
                const lines = packet.lines;
                this.emit('bulk-data', lines);
                break;
            case 12: // Active tiles shape
                const activeTiles = packet.tile;
                this.emit('active-tiles', activeTiles);
                break;
            case 13: // Next tiles shape
                const nextTiles = packet.tile;
                this.emit('next-tiles', nextTiles);
                break;
            case 14: { // Active position
                const x = packet.x;
                const y = packet.y;
                this.emit('active-pos', x, y);
                break;
            }
            case 15: // Rotate piece
                this.emit('rotate');
                break;
            case 16: // Score
                const score = packet.score;
                this.emit('score', score);
                break;
            case 17: // Map size
                const width = packet.width;
                const height = packet.height;
                this.emit('map-size', width, height);
                break;
            case 18: // Game modes
                const modes = packet.modes;
                this.emit('game-modes', modes);
                break;
            case 19: { // Other player piece
                const uuid = packet.uuid;
                const x = packet.x;
                const y = packet.y;
                const shape = packet.tile;
                this.emit('other-piece', uuid, x, y, shape);
            }
        }
    }
}
exports.NetworkClient = NetworkClient;
//# sourceMappingURL=net.js.map