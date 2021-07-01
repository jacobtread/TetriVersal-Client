"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateMatrix = exports.clone = void 0;
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.clone = clone;
function rotateMatrix(matrix) {
    const rotated = clone(matrix);
    const size = rotated.length;
    const x = Math.floor(size / 2);
    const y = size - 1;
    for (let i = 0; i < x; i++) {
        for (let j = i; j < y - i; j++) {
            const temp = rotated[i][j];
            rotated[i][j] = rotated[y - j][i];
            rotated[y - j][i] = rotated[y - i][y - j];
            rotated[y - i][y - j] = rotated[j][y - i];
            rotated[j][y - i] = temp;
        }
    }
    return rotated;
}
exports.rotateMatrix = rotateMatrix;
//# sourceMappingURL=utils.js.map