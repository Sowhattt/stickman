// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ad } from "../../sdk/ad";
import uiBase from "../../uiBase";
import GameManager from "../GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class losePanel extends uiBase {


    onLoad () {
        this.initUi();
    }

    start () {
        ad.recordEnd();
    }
    share(){
        ad.recordShare(isok=>{
            if(isok){
                this.node.destroy();
                GameManager.instance.playerController.revive();
                ad.record();
            }
        });
    }
    giveUp(){
        cc.Tween.stopAll();
        cc.director.loadScene("main");
    }
}
