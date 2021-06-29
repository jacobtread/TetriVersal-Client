import WebSocket from "ws";
import EventEmitter from "events"

interface PacketStruct {
    readonly id: number
    readonly [key: string]: any
}

export declare interface NetworkClient {
    on(event: 'keep-alive', listener: () => void): this;

    on(event: 'connected', listener: () => void): this;

    on(event: 'joined', listener: () => void): this;

    on(event: 'controlling', listener: (controlling: boolean) => void): this;

    on(event: 'controller', listener: (uuid: string, name: string) => void): this;

    on(event: 'starting-in', listener: (time: number) => void): this;

    on(event: 'started', listener: () => void): this;

    on(event: 'game-over', listener: () => void): this;

    on(event: 'player-join', listener: (uuid: string, name: string) => void): this;

    on(event: 'player-leave', listener: (uuid: string, name: string) => void): this;

    on(event: 'disconnected', listener: (reason: string) => void): this;

    on(event: 'map-size', listener: (width: number, height: number) => void): this;

    on(event: 'bulk-data', listener: (lines: string[]) => void): this;

    on(event: 'active-tiles', listener: (shape: number[][]) => void): this;

    on(event: 'next-tiles', listener: (shape: number[][]) => void): this;

    on(event: 'active-pos', listener: (x: number, y: number) => void): this;

    on(event: 'score', listener: (score: number) => void): this;

    on(event: 'other-piece', listener: (uuid: string, x: number, y: number, shape: number[][]) => void): this;

    on(event: 'rotate', listener: () => void): this;

    on(event: 'game-modes', listener: (modes: any) => void): this;

    emit(event: string, ...args: any[]): boolean;

    on(event: string, listener: Function): this;
}

export class NetworkClient extends EventEmitter {

    client: WebSocket;
    aliveTimeout: NodeJS.Timeout;

    constructor() {
        super()
    }

    connect(host: string) {
        this.client = new WebSocket(host);
        this.aliveTimeout = this.createTimeout();
        this.client.on('open', () => this.emit('connected'));
        this.client.on('message', data => {
            const packet: any = JSON.parse(data.toString());
            if (packet.hasOwnProperty("id")) {
                this.process(packet as PacketStruct).then().catch();
            } else {
                // TODO: Bad packet handling
            }
        })
    }

    createTimeout(): NodeJS.Timeout {
        return setTimeout(() => this.send({id: 0}) /* SEND KEEP ALIVE */, 500);
    }

    async send(packet: any): Promise<void> {
        this.client.send(JSON.stringify(packet));
        clearTimeout(this.aliveTimeout);
        this.aliveTimeout = this.createTimeout();
    }

    _send(packet: any): void {
        this.send(packet).then().catch();
    }

    async process(packet: PacketStruct) {
        const id = packet.id;
        switch (id) {
            case 0: // Server is alive
                this.emit('alive');
                break;
            case 1:  // Joined the game
                this.emit('joined', packet.uuid);
                break;
            case 2: // Failed to join
            case 3: // Disconnected
                const reason: string = packet.reason;
                this.emit('disconnected', reason);
                break;
            case 4:
            case 5: // Player join
                const name: string = packet.name;
                const uuid: string = packet.uuid;
                if (id == 4) this.emit('player-join', uuid, name);
                else this.emit('player-leave', uuid, name);
                break;
            case 6:
                this.emit('started');
                break;
            case 7:
                const time: number = packet.time;
                this.emit('starting-in', time);
                break;
            case 8:
                this.emit('game-over');
                break
            case 9: // Control packet
            case 10: // Other player controls
                this.emit('controlling', id == 9)
                if (id == 10) {
                    const uuid: string = packet.uuid;
                    const name: string = packet.name;
                    this.emit('controller', uuid, name)
                }
                break;
            case 11: // Bulk update
                const lines: string[] = packet.lines;
                this.emit('bulk-data', lines);
                break;
            case 12: // Active tiles shape
                const activeTiles: number[][] = packet.tile;
                this.emit('active-tiles', activeTiles);
                break;
            case 13: // Next tiles shape
                const nextTiles: number[][] = packet.tile;
                this.emit('next-tiles', nextTiles);
                break;
            case 14: { // Active position
                const x: number = packet.x;
                const y: number = packet.y;
                this.emit('active-pos', x, y);
                break;
            }
            case 15: // Rotate piece
                this.emit('rotate');
                break;
            case 16: // Score
                const score: number = packet.score;
                this.emit('score', score);
                break;
            case 17: // Map size
                const width: number = packet.width;
                const height: number = packet.height;
                this.emit('map-size', width, height);
                break;
            case 18: // Game modes
                const modes: any = packet.modes;
                this.emit('game-modes', modes);
                break;
            case 19: {// Other player piece
                const uuid: string = packet.uuid;
                const x: number = packet.x;
                const y: number = packet.y;
                const shape: number[][] = packet.tile;
                this.emit('other-piece', uuid, x, y, shape)
            }
        }
    }

}

export interface NetworkHandler {

    connect();

}