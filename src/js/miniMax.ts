import { Board } from "./board";
// tslint:disable-next-line:ordered-imports
import { ipcRenderer } from "electron";

export class MiniMax {

    public static nextMove(board: Board, depth: number = 4, alpha: number = null,
                           beta: number = null, max: boolean = true): number[] {
        const score: number = MiniMax.getBoardScore(board);

        if (depth === 0 || Math.abs(score) === MiniMax.WinningScore || board.full()) {
            return [null, score];
        }

        let bestColumn: number = null;
        let bestScore: number = (max) ? -MiniMax.BestScore : MiniMax.BestScore;

        for (let column: number = 0; column < board.columns; column++) {
            const newBoard: Board = board.copy();

            if (newBoard.place(column)) {
                const [nextColumn, nextScore] = MiniMax.nextMove(newBoard, depth - 1, alpha, beta, !max);

                if (bestColumn === null || (max && nextScore > bestScore) || (!max && nextScore < bestScore)) {
                    bestColumn = column;
                    bestScore = nextScore;

                    if (max) {
                        alpha = nextScore;
                    } else {
                        beta = nextScore;
                    }
                }

                if (alpha >= beta) {
                    ipcRenderer.send("log", "alpha: " + alpha + " beta: " + beta + " score: " + bestScore);
                    return [bestColumn, bestScore];
                }
            }
        }

        return [bestColumn, bestScore];
    }

    private static WinningScore: number = 100000;
    private static BestScore: number = 99999;

    private static getBoardScore(board: Board) {
        let points: number = 0;

        const deltaOffsets: Array<[number, number, number, number, number]> = [
            [0, -3, 0, 1, 0], [0, 0, -3, 0, 1],
            [0, -3, -3, 1, 1], [3, 0, -3, -1, 1]];

        for (const delta of deltaOffsets) {
            const [initial, offsetX, offsetY, deltaX, deltaY] = delta;
            for (let row: number = initial; row < board.rows + offsetX; row++) {
                for (let column: number = 0; column < board.columns + offsetY; column++) {
                    const score: number = MiniMax.scorePosition(board, row, column, deltaX, deltaY);
                    if (Math.abs(score) === MiniMax.WinningScore) {
                        return score;
                    }
                    points += score;
                }
            }
        }

        return points;
    }

    private static scorePosition(board: Board, row: number, column: number, deltaX: number, deltaY: number): number {
        let humanPoints: number = 0;
        let computerPoints: number = 0;

        for (let i: number = 0; i < 4; i++) {
            if (board.get(row, column) === 1) {
                humanPoints++;
            } else if (board.get(row, column) === 2) {
                computerPoints++;
            }
            row += deltaX;
            column += deltaY;
        }

        return (humanPoints === 4) ? -MiniMax.WinningScore : (computerPoints === 4)
            ? MiniMax.WinningScore : computerPoints;
    }
}
