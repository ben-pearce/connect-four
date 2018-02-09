class FourFace {

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;

    public constructor() {
        require("pixi.js");
        this.app = new PIXI.Application({
            height: 400, transparent: true,
            width: 500,
        });
        this.loader = new PIXI.loaders.Loader();

        this.loader.add("board", "images/board.png")
            .add("chipBlue", "images/chip-blue.png")
            .add("chipRed", "images/chip-red.png")
            .load((loader, resources) => {
                this.assetsLoaded(loader, resources);
            });

        consoleLog()(this.app);
    }

    public assetsLoaded(loader, resources) {
        consoleLog()("assets loaded!");

        const boardSprite: PIXI.Sprite = new PIXI.Sprite(resources.board.texture);

        boardSprite.y = 30;
        this.app.stage.addChild(boardSprite);

        const column: PIXI.Graphics = new PIXI.Graphics();
        column.lineStyle(4, 0xFF3300, 1);
        column.beginFill(0x66CCFF);
        column.drawRect(0, 0, 64, 64);
        column.endFill();
        column.x = 170;
        column.y = 170;
        this.app.stage.addChild(column);
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
