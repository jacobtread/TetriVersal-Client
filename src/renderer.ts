import {Container, Sprite, Texture} from "pixi.js";
import {clone, rotateMatrix} from "./utils";

type Piece = { x: number, y: number, tiles: number[][] };

interface PieceStorage {
    [uuid: string]: Piece;
}

const DEFAULT_TINT: number = 0x00000F;

export class Renderer extends Container {

    spriteRows: Sprite[][] = [];
    otherPieces: PieceStorage = {};
    activePiece: Piece = {x: -50, y: -50, tiles: []};

    data: number[][];
    mapWidth: number;
    mapHeight: number;

    resizeMap(width: number, height: number) {
        this.mapWidth = width;
        this.mapHeight = height;
        this.createTiles()
    }

    rotateTiles() {
        this.activePiece.tiles = rotateMatrix(this.activePiece.tiles);
    }

    resizeScreen() {
        const tileSize: number = this.tileSize();
        for (let y = 0; y < this.mapHeight; y++) {
            const spriteRow: Sprite[] = this.spriteRows[y];
            for (let x = 0; x < this.mapWidth; x++) {
                const sprite: Sprite = spriteRow[x];
                sprite.x = x * tileSize;
                sprite.y = y * tileSize;
                sprite.width = sprite.height = tileSize;
            }
        }
    }

    replaceTiles(data: number[][], x: number, y: number, tiles: number[][]) {
        for (let y1 = 0; y1 < tiles.length; y1++) {
            const relY: number = y + y1;
            const row: number[] = tiles[y1]
            for (let x1 = 0; x1 < row.length; x1++) {
                const relX: number = x + x1;
                const tile: number = row[x1];
                if (tile > 0
                    && relX >= 0
                    && relX < this.mapWidth
                    && relY < this.mapHeight
                    && relY >= 0
                ) {
                    data[relY][relX] = tile;
                }
            }
        }
    }


    tintTiles(): void {
        const data: number[][] = clone(this.data)
        for (let key in this.otherPieces) {
            if (this.otherPieces.hasOwnProperty(key)) {
                const piece: Piece = this.otherPieces[key] as Piece;
                this.replaceTiles(data, piece.x, piece.y, piece.tiles)
            }
        }
        this.replaceTiles(data, this.activePiece.x, this.activePiece.y, this.activePiece.tiles)
        for (let y = 0; y < this.mapHeight; y++) {
            const row: number[] = data[y]
            const spriteRow: Sprite[] = this.spriteRows[y]
            for (let x = 0; x < this.mapWidth; x++) {
                const tile: number = row[x]
                const sprite: Sprite = spriteRow[x]
                if (tile === 0) {
                    sprite.tint = 0x00000F;
                } else if (tile === 1) {
                    sprite.tint = 0x823131;
                } else if (tile === 2) {
                    sprite.tint = 0xd4db72;
                } else if (tile === 3) {
                    sprite.tint = 0x8fdb72;
                } else if (tile === 4) {
                    sprite.tint = 0x72db91;
                } else if (tile === 5) {
                    sprite.tint = 0x727adb;
                } else if (tile === 6) {
                    sprite.tint = 0xdb72c2;
                }
            }
        }
    }

    createTiles(): void {
        this.activePiece = {x: -50, y: -50, tiles: []};
        this.data = new Array(this.mapHeight);
        this.otherPieces = {};
        this.spriteRows = [];
        const tileSize: number = this.tileSize();
        for (let y = 0; y < this.mapHeight; y++) {
            this.data[y] = new Array(this.mapWidth).fill(0);
            const spriteRow: Sprite[] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const sprite: Sprite = Sprite.from(Texture.WHITE);
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

    parseBulkData(rawData: string[]) {
        const data: number[][] = new Array(rawData.length);
        for (let y = 0; y < rawData.length; y++) {
            let chunk: string = rawData[y]
            data[y] = chunk.split('').map(parseInt);
        }
        this.data = data;
        this.tintTiles();
    }

    size(): { width: number, height: number } {
        const tileSize: number = this.tileSize();
        return {width: tileSize * this.mapWidth, height: tileSize * this.mapHeight};
    }

    tileSize(): number {
        const screenSize: number = Math.min(window.innerWidth, window.innerHeight);
        const gameSize: number = Math.max(this.mapWidth, this.mapHeight);
        return screenSize / gameSize;
    }

    setOther(uuid: string, x: number, y: number, tiles: number[][]) {
        this.otherPieces[uuid] = {x, y, tiles};
        this.tintTiles();
    }

    setActiveTiles(tiles: number[][]) {
        this.activePiece.tiles = tiles;
        this.setActivePosition(-50, -50)
    }

    setActivePosition(x: number, y: number) {
        this.activePiece.x = x;
        this.activePiece.y = y;
        this.tintTiles();
    }

}