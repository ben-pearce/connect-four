import { ipcRenderer } from "electron";
import * as PIXI from "pixi.js";

class FindFour {

    public board: Array<Array<number>>;
    public columns: number;
    public rows: number;

    public constructor(columns: number, rows:number) {
        for(var column: number = 0; column <= columns; columns++) {
            this.board.push([]);
            for(var row: number = 0; row <= rows; rows++) {
                this.board[column].push(0);
            }
        }
    }
}

class FourFace {

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;

    private boardSprite: PIXI.Sprite;

    public constructor() {
        this.app = new PIXI.Application({
            height: 400, transparent: true,
            width: 450,
        });
        this.loader = new PIXI.loaders.Loader();

        this.loader.add("board", "images/board.png")
            .add("chipBlue", "images/chip-blue.png")
            .add("chipRed", "images/chip-red.png")
            .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                this.assetsLoaded(loader, resources);
            });

        ipcRenderer.send("log", this.app.renderer.height);
    }

    public assetsLoaded(loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) {
        consoleLog()("assets loaded!");

        this.boardSprite = new PIXI.Sprite(resources.board.texture);

        this.boardSprite.anchor.x = 0.5;
        this.boardSprite.y = 30;
        this.boardSprite.x = this.app.renderer.width / 2;
        this.boardSprite.scale.x = 0.7;
        this.boardSprite.scale.y = 0.7;
        this.app.stage.addChild(this.boardSprite);

        this.createColumns();
    }

    public createColumns(at: number = 60) {
        for (let i: number = 0; i < 7; i++) {
            const column: PIXI.Graphics = new PIXI.Graphics();
            column.lineStyle(1, 0x000000, 1);
            column.beginFill(0x000000);
            column.drawRect(0, 0, 45, this.boardSprite.height);
            column.endFill();
            column.interactive = true;
            column.alpha = 0;
            column.y = this.boardSprite.y;
            column.x = 60 + (i * column.width) + ((i === 0) ? 0 : 1);
            column.on("mouseover", () => {
                column.alpha = 0.5;
            });
            column.on("mouseout", () => {
                column.alpha = 0;
            });
            this.app.stage.addChild(column);
        }
    }
}

window.onload = () => {
    const fourFace: FourFace = new FourFace();
    document.body.appendChild(fourFace.app.view);
    consoleLog()("hello world");
};
function consoleLog() {
    return console.log;
}
