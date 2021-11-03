// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ad } from "../../sdk/ad";
import uiBase from "../../uiBase";
import GameManager from "../GameManager";
import uiManager from "./uiManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class buffPopup extends uiBase {


    onLoad () {
        this.initUi();
    }

    start () {

    }

    wudi(){
        ad.video_show().then(isok=>{
            if(isok){
                uiManager.ins.wuDi();
                this.close();
            }
        });
    }
    fullHp(){
        ad.video_show().then(isok=>{
            if(isok){
                uiManager.ins.fullHp();
                this.close();
            }
        });
    }
    doubleDamage(){
        ad.video_show().then(isok=>{
            if(isok){
                uiManager.ins.doubleDamage();
                this.close();
            }
        });
    }
    close(){
        this.node.destroy();
        cc.director.resume();
    }
}
