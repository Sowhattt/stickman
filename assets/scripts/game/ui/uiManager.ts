// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../../caijiTools";
import { ad } from "../../sdk/ad";
import { uiName } from "../../uiBase";
import GameManager from "../GameManager";
import bossHp, { bossName } from "./bossHp";
import playerHp from "./playerHp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class uiManager extends cc.Component {

    @property(cc.Node)
    wuDiNode:cc.Node=null;
    @property(cc.Node)
    doubleDmgNode:cc.Node=null;
    @property(cc.Node)
    fullHpNode:cc.Node=null;
    @property(cc.Node)
    bossHpNode:cc.Node=null;
    @property(cc.Node)
    loadingNodeStart:cc.Node=null;
    @property(cc.Node)
    loadingNodeEnd:cc.Node=null;

    bossHp:bossHp=null;
    static ins:uiManager=null;

    onLoad () {
        uiManager.ins=this;
    }

    start () {
        this.init();
    }
    init(){
        this.loadingNodeStart.width=cc.winSize.width*2;
        this.loadingNodeEnd.width=cc.winSize.width*2;
        this.loadingNodeEnd.active=true;
    }
    lose(){
        this.scheduleOnce(()=>{
            caijiTools.showPopup(uiName.losePanel,this.node);
        },1.5);
    }
    pause(){
        caijiTools.showPopup(uiName.pausePanel,this.node);
    }
    win(){
        GameManager.instance.levelCompletEvent();
        this.scheduleOnce(()=>{
            caijiTools.showPopup(uiName.winPanel,this.node);
        },2.5);
    }
    showUi(){
        this.wuDiNode.active=true;
        this.doubleDmgNode.active=true;
        this.fullHpNode.active=true;
    }
    async showWuDiPopup(){
        await caijiTools.showPopup(uiName.wuDiPopup,this.node);
        cc.director.pause();
    }
    async showFullHpPopup(){
        await caijiTools.showPopup(uiName.fullHpPopup,this.node);
        cc.director.pause();
    }
    async showDoubleDamagePopup(){
        await caijiTools.showPopup(uiName.doubleDamagePopup,this.node);
        cc.director.pause();
    }
    wuDi(){
        if(GameManager.instance.playerController.isDie) return;
        this.wuDiNode.active=false;
        GameManager.instance.playerController.openWuDi(10);
        this.scheduleOnce(()=>{
            this.wuDiNode.active=true;
        },10);
    }
    doubleDamage(){
        if(GameManager.instance.playerController.isDie) return;
        playerHp.instance.damageScale*=2;
        this.doubleDmgNode.active=false;
    }
    fullHp(){
        if(GameManager.instance.playerController.isDie) return;
        playerHp.instance.fullHp();
    }
    showBossHp(bossName:string){
        this.bossHp=this.bossHpNode.getComponent(bossHp);
        this.bossHp.bossName=bossName;
        this.bossHp.init(()=>{
            this.bossHpNode.active=true;
        });
    }
    loadingStart(callBack:Function){
        this.loadingNodeStart.x=cc.winSize.width/2;
        this.loadingNodeStart.width=cc.winSize.width+1064;
        this.loadingNodeStart.active=true;
        let movex=-this.loadingNodeStart.width*this.loadingNodeStart.scaleX;
        cc.tween(this.loadingNodeStart)
        .by(0.6,{x:movex})
        .call(()=>{
            callBack();
        })
        .start();
    }
    loadingEnd(){
        this.loadingNodeEnd.x=-cc.winSize.width/2;
        this.loadingNodeEnd.width=cc.winSize.width+1064;
        this.loadingNodeEnd.active=true;
        this.loadingNodeStart.active=false;
        let movex=-this.loadingNodeEnd.width*Math.abs(this.loadingNodeEnd.scaleX);
        cc.tween(this.loadingNodeEnd)
        .by(0.6,{x:movex})
        .call(()=>{
            this.loadingNodeEnd.active=false;
            GameManager.instance.spawnPlayer();
        })
        .start();
    }
}
