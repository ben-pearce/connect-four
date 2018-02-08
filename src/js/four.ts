var PIXI = require("pixi.js")

class FourFace {

    public app:any;
    public loader:any;

    public constructor (){
        this.app = new PIXI.Application({
            width: 500, height: 400,
            transparent: true
        });
        this.loader = new PIXI.loaders.Loader();

        this.loader.add("board", "images/board.png")
            .add("chipBlue", "images/chip-blue.png")
            .add("chipRed", "images/chip-red.png")
            .load((loader, resources) => { 
                this.assetsLoaded(loader, resources) 
            });

        console.log(this.app);
    }

    public assetsLoaded(loader, resources) {
        console.log("assets loaded!");

        var boardSprite = new PIXI.Sprite(resources.board.texture);

        boardSprite.y = 30;
        this.app.stage.addChild(boardSprite);
        boardSprite.scale = new PIXI.Point(0.8, 0.8);

        var column = new PIXI.Graphics();
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
    var fourFace:FourFace = new FourFace();
    document.body.appendChild(fourFace.app.view);
    console.log("hello world");
}