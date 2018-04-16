import * as TWEEN from "@tweenjs/tween.js";
import { ipcRenderer } from "electron";
import * as PIXI from "pixi.js";
import "pixi-layers";

class FindFour {
    public board: number[][];
    public columns: number;
    public rows: number;
    public currentPlayer: number;
    public winningSlots: Array<[number, number]> = [];

    public checkDeltas: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
    public deltaMultipliers: number[] = [1, -1];

    public constructor(rows: number, columns: number) {
        this.rows = rows;
        this.columns = columns;
        this.currentPlayer = 1;

        this.board = [];
        for (let row: number = 0; row <= (this.rows - 1); row++) {
            this.board.push([]);
            for (let column: number = 0; column <= (this.columns - 1); column++) {
                this.board[row].push(0);
            }
        }
    }

    public placeChip(row: number, column: number) {
        this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;
        this.board[row][column] = this.currentPlayer;
    }

    public getEmptyRow(column: number): number {
        for (let row: number = 0; row <= (this.rows - 1); row++) {
            if (this.board[row][column] === 0) {
                return row;
            }
        }
    }

    public checkWinPosition(row: number, column: number): boolean {
        const searchValue = this.board[row][column];
        for (const deltaMove of this.checkDeltas) {
            let [ deltaRow, deltaColumn ] = deltaMove;
            let consecutiveItems: number = 1;
            for (const delta of this.deltaMultipliers) {
                deltaRow *= delta;
                deltaColumn *= delta;
                let nextRow: number = row + deltaRow;
                let nextColumn: number = column + deltaColumn;
                this.winningSlots = [];
                while (0 <= nextRow && nextRow < this.rows && 0 <= nextColumn && nextColumn < this.columns) {
                    if (this.board[nextRow][nextColumn] === searchValue) {
                        consecutiveItems += 1;
                        this.winningSlots.push([nextRow, nextColumn]);
                    } else {
                        break;
                    }
                    if (consecutiveItems === 4) {
                        this.winningSlots.push([row, column]);
                        return true;
                    }
                    nextRow += deltaRow;
                    nextColumn += deltaColumn;
                }
            }
        }
        this.winningSlots = [];
        return false;
    }
}

// tslint:disable-next-line:max-classes-per-file
class FourFace {

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;
    public chipPlacedCallback: (column: number) => void;

    private boardSprite: PIXI.Sprite;
    private activeChip: PIXI.Sprite;
    private resources: PIXI.loaders.ResourceDictionary;
    private columns: PIXI.Graphics[] = [];
    private chips: PIXI.Sprite[][] = [];
    private handPosition: number;

    private boardGroup: pixi_display.Group;
    private activeGroup: pixi_display.Group;
    private slotGroup: pixi_display.Group;

    public constructor() {
        this.app = new PIXI.Application({
            height: 500, transparent: true,
            width: 500,
        });

        for (let row: number = 0; row <= (5); row++) {
            this.chips.push([]);
            for (let column: number = 0; column <= (6); column++) {
                this.chips[row].push(null);
            }
        }

        this.loader = new PIXI.loaders.Loader();
        this.app.stage = new PIXI.display.Stage();

        this.slotGroup = new PIXI.display.Group(0, false);
        this.boardGroup = new PIXI.display.Group(1, false);
        this.activeGroup = new PIXI.display.Group(2, false);

        this.app.stage.addChild(new PIXI.display.Layer(this.slotGroup));
        this.app.stage.addChild(new PIXI.display.Layer(this.boardGroup));
        this.app.stage.addChild(new PIXI.display.Layer(this.activeGroup));

        this.loader.add("board", "images/board.png")
            .add("chipBlue", "images/chip-blue.png")
            .add("chipRed", "images/chip-red.png")
            .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                this.assetsLoaded(loader, resources);
            });

        requestAnimationFrame((time: number) => {
            this.animate(time);
        });
    }

    public animate(time: number) {
        requestAnimationFrame((frameTime: number) => {
            this.animate(frameTime);
        });
        TWEEN.update(time);
    }

    public assetsLoaded(loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) {
        this.resources = resources;

        this.boardSprite = new PIXI.Sprite(resources.board.texture);
        this.boardSprite.parentGroup = this.boardGroup;
        this.app.stage.addChild(this.boardSprite);

        this.boardSprite.anchor.x = 0.5;
        this.boardSprite.y = 50;
        this.boardSprite.x = this.app.renderer.width / 2;
        this.boardSprite.scale.set(0.5, 0.5);

        this.activeChip = this.createNewChip(resources.chipBlue.texture);
        this.app.stage.addChild(this.activeChip);

        this.createColumns();
    }

    public createNewChip(chipTexture: PIXI.Texture): PIXI.Sprite  {
        const activeChip: PIXI.Sprite = new PIXI.Sprite(chipTexture);
        activeChip.height = 60;
        activeChip.width = 60;
        activeChip.y = 30;
        activeChip.anchor.set(0.5, 0.5);
        activeChip.visible = false;
        activeChip.parentGroup = this.activeGroup;
        return activeChip;
    }

    public placeActiveChip(row: number, chipId: number = 0) {
        this.setColumnsState(false);
        this.activeChip.parentGroup = this.slotGroup;
        this.activeChip.width = 50;
        this.activeChip.height = 50;
        const slotY: number = ((this.boardSprite.height / 6) * 1.4) + (((this.boardSprite.height / 6) * 0.95) * row);

        const chips: PIXI.Texture[] = [this.resources.chipBlue.texture, this.resources.chipRed.texture];

        new TWEEN.Tween(this.activeChip)
            .to({ y: slotY }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onComplete(() => {
                this.activeChip = this.createNewChip(chips[chipId]);
                this.app.stage.addChild(this.activeChip);
                this.setColumnsState(true);
            })
            .start();

        this.chips[row][this.handPosition] = this.activeChip;
        ipcRenderer.send("log", "row: " + row + " column: " + this.handPosition + " chip: " + this.activeChip);
    }

    public moveActiveChip(column: PIXI.Graphics) {
        this.activeChip.visible = false;
        this.activeChip.width = 20;
        this.activeChip.height = 20;
        this.activeChip.visible = true;
        this.activeChip.x = column.x + (column.width / 2);

        new TWEEN.Tween(this.activeChip)
            .to({ width: 60, height: 60 }, 400)
            .easing(TWEEN.Easing.Quartic.Out)
            .start();
    }

    public createColumns(at: number = 60) {
        for (let i: number = 0; i < 7; i++) {
            const column: PIXI.Graphics = new PIXI.Graphics();

            column.lineStyle(0, 0x000000, 1);
            column.beginFill(0x000000, 0);
            column.drawRect(0, 0, 63, this.boardSprite.height);
            column.endFill();

            column.interactive = true;
            column.buttonMode = true;
            column.parentGroup = this.activeGroup;
            column.defaultCursor = "pointer";
            column.y = this.boardSprite.y;

            const boardEdge = this.boardSprite.x - (this.boardSprite.width / 2);
            column.x = boardEdge + 10 + (63 * i);

            column.on("mouseover", () => {
                this.handPosition = i;
                this.moveActiveChip(column);
            });

            column.on("mouseup", () => { this.chipPlacedCallback(i); });

            this.app.stage.addChild(column);
            this.columns.push(column);
        }
    }

    public showWinningChips(winningPositions: Array<[number, number]>) {
        for (const position of winningPositions) {
            const [row, column] = position;
            const chip: PIXI.Sprite = this.chips[row][column];
            ipcRenderer.send("log", row.toString() + "," + column.toString());
            new TWEEN.Tween(chip)
                .to({ alpha: 30 }, 500)
                .easing(TWEEN.Easing.Quartic.Out)
                .start();
        }
    }

    private setColumnsState(interactive: boolean) {
        this.columns.forEach((column) => {
            column.interactive = interactive;
        });
    }
}

window.onload = () => {
    const findFour: FindFour = new FindFour(6, 7);
    const fourFace: FourFace = new FourFace();
    fourFace.chipPlacedCallback = (column: number) => {
        const emptyRow: number = findFour.getEmptyRow(column);
        findFour.placeChip(emptyRow, column);
        fourFace.placeActiveChip(5 - emptyRow, findFour.currentPlayer - 1);
        if (findFour.checkWinPosition(emptyRow, column)) {
            fourFace.showWinningChips(findFour.winningSlots);
            ipcRenderer.send("log", findFour.winningSlots);
        }
    };
    document.body.appendChild(fourFace.app.view);
};
