export function clone<O>(object: O): O {
    return JSON.parse(JSON.stringify(object))
}

export function rotateMatrix(matrix: number[][]): number[][] {
    const rotated: number[][] = clone(matrix);
    const size: number = rotated.length;
    const x: number = Math.floor(size / 2);
    const y: number = size - 1;
    for (let i = 0; i < x; i++) {
        for (let j = i; j < y - i; j++) {
            const temp: number = rotated[i][j];
            rotated[i][j] = rotated[y - j][i];
            rotated[y - j][i] = rotated[y - i][y - j];
            rotated[y - i][y - j] = rotated[j][y - i];
            rotated[j][y - i] = temp;
        }
    }
    return rotated;
}