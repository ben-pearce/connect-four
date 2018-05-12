import { FindFour } from "./findFour";
import { FourFace } from "./fourFace";
import { MiniMax } from "./miniMax";
import { GameState } from "./states/gameState";
import { ipcRenderer } from "electron";
import { constants } from "fs";

window.onload = () => {
    const findFour: FindFour = new FindFour(6, 7);
    const fourFace: FourFace = new FourFace();
    fourFace.chipPlacedCallback = (column: number) => {
        const gameState: GameState = fourFace.getState(GameState);
        findFour.board.place(column);
        const row = findFour.board.last;
        gameState.placeActiveChip(row, findFour.board.player - 1);

        if (findFour.checkWinPosition(row, column)) {
            ipcRenderer.send("log", "Human won!");
        }
    };

    fourFace.chipLandedCallback = () => {
        if (findFour.board.player === 2) {
            const gameState: GameState = fourFace.getState(GameState);
            const [nextColumn, nextScore] = MiniMax.nextMove(findFour.board, 6);
            const columnMovie = gameState.getColumn(nextColumn);
            gameState.moveActiveChip(columnMovie);
            findFour.board.place(nextColumn);
            const nextRow: number = findFour.board.last;
            gameState.placeActiveChip(nextRow, findFour.board.player - 1);

            if (findFour.checkWinPosition(nextRow, nextColumn)) {
                ipcRenderer.send("log", "Computer won!");
            }
        }
    };

    document.body.appendChild(fourFace.app.view);
};
