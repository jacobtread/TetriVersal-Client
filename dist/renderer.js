"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const pixi_js_1 = require("pixi.js");
const utils_1 = require("./utils");
const DEFAULT_TINT = 0x00000F;
class Renderer extends pixi_js_1.Container {
    constructor() {
        super(...arguments);
        this.spriteRows = [];
        this.otherPieces = {};
        this.activePiece = { x: -50, y: -50, tiles: [] };
    }
    resizeMap(width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
        this.createTiles();
    }
    rotateTiles() {
        this.activePiece.tiles = utils_1.rotateMatrix(this.activePiece.tiles);
    }
    resizeScreen() {
        const tileSize = this.tileSize();
        for (let y = 0; y < this.mapHeight; y++) {
            const spriteRow = this.spriteRows[y];
            for (let x = 0; x < this.mapWidth; x++) {
                const sprite = spriteRow[x];
                sprite.x = x * tileSize;
                sprite.y = y * tileSize;
                sprite.width = sprite.height = tileSize;
            }
        }
    }
    replaceTiles(data, x, y, tiles) {
        for (let y1 = 0; y1 < tiles.length; y1++) {
            const relY = y + y1;
            const row = tiles[y1];
            for (let x1 = 0; x1 < row.length; x1++) {
                const relX = x + x1;
                const tile = row[x1];
                if (tile > 0
                    && relX >= 0
                    && relX < this.mapWidth
                    && relY < this.mapHeight
                    && relY >= 0) {
                    data[relY][relX] = tile;
                }
            }
        }
    }
    tintTiles() {
        const data = utils_1.clone(this.data);
        for (let key in this.otherPieces) {
            if (this.otherPieces.hasOwnProperty(key)) {
                const piece = this.otherPieces[key];
                this.replaceTiles(data, piece.x, piece.y, piece.tiles);
            }
        }
        this.replaceTiles(data, this.activePiece.x, this.activePiece.y, this.activePiece.tiles);
        for (let y = 0; y < this.mapHeight; y++) {
            const row = data[y];
            const spriteRow = this.spriteRows[y];
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = row[x];
                const sprite = spriteRow[x];
                if (tile === 0) {
                    sprite.tint = 0x00000F;
                }
                else if (tile === 1) {
                    sprite.tint = 0x823131;
                }
                else if (tile === 2) {
                    sprite.tint = 0xd4db72;
                }
                else if (tile === 3) {
                    sprite.tint = 0x8fdb72;
                }
                else if (tile === 4) {
                    sprite.tint = 0x72db91;
                }
                else if (tile === 5) {
                    sprite.tint = 0x727adb;
                }
                else if (tile === 6) {
                    sprite.tint = 0xdb72c2;
                }
            }
        }
    }
    createTiles() {
        this.activePiece = { x: -50, y: -50, tiles: [] };
        this.data = new Array(this.mapHeight);
        this.otherPieces = {};
        this.spriteRows = [];
        const tileSize = this.tileSize();
        for (let y = 0; y < this.mapHeight; y++) {
            this.data[y] = new Array(this.mapWidth).fill(0);
            const spriteRow = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const sprite = pixi_js_1.Sprite.from(pixi_js_1.Texture.WHITE);
                sprite.x = x * tileSize;
                sprite.y = y * tileSize;
                sprite.width = sprite.height = tileSize;
                sprite.tint = DEFAULT_TINT;
                spriteRow[x] = sprite;
                this.addChild(sprite);
            }
            this.spriteRows[y] = spriteRow;
        }
    }
    parseBulkData(rawData) {
        const data = new Array(rawData.length);
        for (let y = 0; y < rawData.length; y++) {
            let chunk = rawData[y];
            data[y] = chunk.split('').map(parseInt);
        }
        this.data = data;
        this.tintTiles();
    }
    size() {
        const tileSize = this.tileSize();
        return { width: tileSize * this.mapWidth, height: tileSize * this.mapHeight };
    }
    tileSize() {
        const screenSize = Math.min(window.innerWidth, window.innerHeight);
        const gameSize = Math.max(this.mapWidth, this.mapHeight);
        return screenSize / gameSize;
    }
    setOther(uuid, x, y, tiles) {
        this.otherPieces[uuid] = { x, y, tiles };
        this.tintTiles();
    }
    setActiveTiles(tiles) {
        this.activePiece.tiles = tiles;
        this.setActivePosition(-50, -50);
    }
    setActivePosition(x, y) {
        this.activePiece.x = x;
        this.activePiece.y = y;
        this.tintTiles();
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map