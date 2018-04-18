import { FindFour } from "./findFour";
import { FourFace } from "./fourFace";
import { MiniMax } from "./miniMax";

import { ipcRenderer } from "electron";
import { constants } from "fs";

window.onload = () => {
    const findFour: FindFour = new FindFour(6, 7);
    const fourFace: FourFace = new FourFace();
    fourFace.chipPlacedCallback = (column: number) => {
        findFour.board.place(column);
        const row = findFour.board.last;
        fourFace.placeActiveChip(row, findFour.board.player - 1);

        if (findFour.checkWinPosition(row, column)) {
            fourFace.showWinningChips(findFour.winningSlots);
        }
    };

    fourFace.chipLandedCallback = () => {
        if (findFour.board.player === 2) {
            const [nextColumn, nextScore] = MiniMax.nextMove(findFour.board, 8);
            const columnMovie = fourFace.getColumn(nextColumn);
            fourFace.moveActiveChip(columnMovie);
            findFour.board.place(nextColumn);
            const nextRow: number = findFour.board.last;
            fourFace.placeActiveChip(nextRow, findFour.board.player - 1);

            if (findFour.checkWinPosition(nextRow, nextColumn)) {
                fourFace.showWinningChips(findFour.winningSlots);
            }
        }
    };

    document.body.appendChild(fourFace.app.view);
};
