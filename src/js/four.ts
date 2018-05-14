import { FindFour } from "./findFour";
import { FourFace } from "./fourFace";
import { MiniMax } from "./miniMax";
import { GameState } from "./states/gameState";
import { ipcRenderer } from "electron";
import { constants } from "fs";

window.onload = () => {
    let findFour: FindFour = new FindFour(6, 7);
    const fourFace: FourFace = new FourFace();

    fourFace.resetCallback = () => {
        findFour = new FindFour(findFour.board.rows, findFour.board.columns);
    };

    const checkWin = (gameState: GameState, row: number, column: number) => {
        if (findFour.checkWinPosition(row, column)) {
            gameState.finish();
            gameState.showWinningChips(findFour.winningSlots);
        }

        if (findFour.board.full()) {
            gameState.finish(true);
        }
    };

    fourFace.chipPlacedCallback = (column: number) => {
        const gameState: GameState = fourFace.getState(GameState);
        findFour.board.place(column);
        const row = findFour.board.last;
        gameState.placeActiveChip(row);
        checkWin(gameState, row, column);
    };

    fourFace.chipLandedCallback = () => {
        if (findFour.board.player === 2 && fourFace.gameMode === FourFace.Computer) {
            const gameState: GameState = fourFace.getState(GameState);
            const [nextColumn, nextScore] = MiniMax.nextMove(findFour.board, fourFace.difficulty);
            gameState.moveActiveChip(nextColumn);
            findFour.board.place(nextColumn);
            const nextRow: number = findFour.board.last;
            gameState.placeActiveChip(nextRow);
            checkWin(gameState, nextRow, nextColumn);
        }
    };

    document.body.appendChild(fourFace.app.view);
};
