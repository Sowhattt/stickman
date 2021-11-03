// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ad } from "../../sdk/ad";
import { data } from "../../sdk/data";
import uiBase from "../../uiBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class winPanel extends uiBase {


    onLoad () {
        this.initUi();
    }

    start () {
        ad.recordEnd();
    }
    share(){
        ad.recordShare(isok=>{
            if(isok){
                this.getCoin(50);
                this.giveUp();
            }
        });
    }
    getCoin(getNum:number){
        let coin=Number(data.getCache("Base","coin"))+getNum;
        data.updateCache("Base","coin",coin);
    }
    giveUp(){
        cc.Tween.stopAll();
        cc.director.loadScene("main");
    }
}
