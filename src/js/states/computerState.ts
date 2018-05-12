import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { FourFace } from "../fourFace";
import { MenuState } from "./menuState";
import { State } from "./state";

export class ComputerState extends State {

    constructor(app: FourFace) {
        super(app);

        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0xFFFFFF,
            fontFamily: "Arial", fontSize: 30,
            fontWeight: "bold",
        });

        const playerText: PIXI.Text = new PIXI.Text("Enter your name: ", textStyle);
        playerText.position.set(50, 150);
        const easy: pixi_display.Layer = this.drawButton(50, 330, 400, 50, "Easy");
        const medium: pixi_display.Layer = this.drawButton(50, 400, 400, 50, "Medium");
        const hard: pixi_display.Layer = this.drawButton(50, 470, 400, 50, "Hard");
        const back: pixi_display.Layer = this.drawButton(50, 590, 400, 50, "Go back");
        this.layer.addChild(playerText, easy, medium, hard, back);

        back.on("mouseup", () => {
            this.app.updateState(MenuState);
        });
    }

    public show(): void {
        this.layer.visible = true;
        const playerInput: HTMLInputElement = this.createTextBox(200, 50, 350);
    }

    public hide(): void {
        this.layer.visible = false;
        this.destroyTextBox();
    }
}
