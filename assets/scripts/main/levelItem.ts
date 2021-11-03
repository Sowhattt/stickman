// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import { data } from "../sdk/data";
import { bundleName } from "../uiBase";
import mainMenu from "./mainMenu";


const {ccclass, property} = cc._decorator;

@ccclass
export default class levelItem extends cc.Component {

    @property(cc.Sprite)
    starSpr:cc.Sprite=null;
    @property(cc.Sprite)
    levelSpr:cc.Sprite=null;

    level:number=0;
    // onLoad () {}

    start () {
        this.init();
    }
    init(){
        this.level=Number(this.node.name);
        let isUnlock=data.getCache("levelUnlock",(this.level-1).toString());
        if(isUnlock){
            this.node.getComponent(cc.Button).interactable=true;
            this.node.getChildByName("lock").active=false;
        }
        this.updateLevel();
        this.updateStar();
    }
    async updateLevel(){
        let spr=await caijiTools.loadSpriteFrameBundle(bundleName.mainUi,"choseLevel/level"+this.node.name);
        this.levelSpr.getComponent(cc.Sprite).spriteFrame=spr;
    }
    async updateStar(){
        let diff=Number(data.getCache("levelStar",this.level.toString()));
        let spr=await caijiTools.loadSpriteFrameBundle(bundleName.mainUi,"choseLevel/star"+diff);
        this.starSpr.getComponent(cc.Sprite).spriteFrame=spr;
    }
    chose(event:cc.Event){
        data.updateCache("Base","choseLevel",this.node.name);
        mainMenu.ins.maskAction_go();
    }
}
