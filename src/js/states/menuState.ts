import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { FourFace } from "../fourFace";
import { ComputerState } from "./computerState";
import { MultiplayerState } from "./multiplayerState";
import { State } from "./state";

export class MenuState extends State {

    public multiplayer: pixi_display.Layer;
    public computer: pixi_display.Layer;

    constructor(app: FourFace) {
        super(app);

        this.multiplayer = this.drawButton(50, 150, 400, 200, "Multiplayer");
        this.computer = this.drawButton(50, 400, 400, 200, "Computer");
        this.layer.addChild(this.multiplayer, this.computer);

        this.multiplayer.on("mouseup", () => {
            this.app.updateState(MultiplayerState);
        });

        this.computer.on("mouseup", () => {
            this.app.updateState(ComputerState);
        });
    }

    public show(): void {
        this.layer.visible = true;
    }

    public hide(): void {
        this.layer.visible = false;
    }
}
