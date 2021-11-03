// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import uiBase from "../../uiBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class pausePanel extends uiBase {

    onLoad () {
        this.initUi();
    }

    start () {
        cc.director.pause();
    }
    resume(){
        cc.director.resume();
        this.node.destroy();
    }
    backToMain(){
        cc.director.resume();
        cc.director.loadScene("main");
    }
}
