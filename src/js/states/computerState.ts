import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { FourFace } from "../fourFace";
import { MenuState } from "./menuState";
import { State } from "./state";
import { GameState } from "./gameState";

export class ComputerState extends State {

    private easy: pixi_display.Layer;
    private medium: pixi_display.Layer;
    private hard: pixi_display.Layer;

    constructor(app: FourFace) {
        super(app);

        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0xFFFFFF,
            fontFamily: "Arial", fontSize: 30,
            fontWeight: "bold",
        });

        const playerText: PIXI.Text = new PIXI.Text("Enter your name: ", textStyle);
        playerText.position.set(50, 150);
        this.easy = this.drawButton(50, 330, 400, 50, "Easy");
        [this.easy.alpha, this.easy.interactive] = [0.2, false];
        this.medium = this.drawButton(50, 400, 400, 50, "Medium");
        [this.medium.alpha, this.medium.interactive] = [0.2, false];
        this.hard = this.drawButton(50, 470, 400, 50, "Hard");
        [this.hard.alpha, this.hard.interactive] = [0.2, false];
        const back: pixi_display.Layer = this.drawButton(50, 590, 400, 50, "Go back");
        this.layer.addChild(playerText, this.easy, this.medium, this.hard, back);

        this.easy.on("mouseup", () => {
            this.app.difficulty = FourFace.Easy;
            this.app.updateState(GameState);
        });

        this.medium.on("mouseup", () => {
            this.app.difficulty = FourFace.Medium;
            this.app.updateState(GameState);
        });

        this.hard.on("mouseup", () => {
            this.app.difficulty = FourFace.Hard;
            this.app.updateState(GameState);
        });

        back.on("mouseup", () => {
            this.app.updateState(MenuState);
        });
    }

    public show(): void {
        this.layer.visible = true;
        this.app.gameMode = FourFace.Computer;
        this.app.playerTwoName = "Computer";
        const playerInput: HTMLInputElement = this.createTextBox(200, 50, 350);

        const checkName = (e: any) => {
            [this.easy.alpha, this.easy.interactive, this.medium.alpha,
                this.medium.interactive, this.hard.alpha, this.hard.interactive] =
                [0.2, false, 0.2, false, 0.2, false];
            const check = /[^a-zA-Z]/;
            const checkResult: boolean = check.test(playerInput.value);
            playerInput.style.color = (checkResult) ? "#FF0000" : "#000000";
            if (playerInput.value) {
                [this.easy.alpha, this.easy.interactive, this.medium.alpha,
                    this.medium.interactive, this.hard.alpha, this.hard.interactive] =
                    (checkResult) ? [0.2, false, 0.2, false, 0.2, false] : [1, true, 1, true, 1, true];
                this.app.playerOneName = this.tidyDisplayName(playerInput.value);
            }
        };
        playerInput.maxLength = 20;
        playerInput.onkeyup = checkName;
    }

    public hide(): void {
        this.layer.visible = false;
        [this.easy.alpha, this.easy.interactive, this.medium.alpha,
            this.medium.interactive, this.hard.alpha, this.hard.interactive] =
            [0.2, false, 0.2, false, 0.2, false];
        this.destroyTextBox();
    }
}
