// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ad } from "../sdk/ad";
import { data } from "../sdk/data";
import uiBase from "../uiBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class upgradePanel extends uiBase {

    @property(cc.Node)
    lvLabels:cc.Node=null;
    @property(cc.Node)
    upgradeBtns:cc.Node=null;

    onLoad() {
        this.initUi();
    }

    start() {
        this.init();
    }
    init(){
        for(let i=0;i<this.lvLabels.childrenCount;i++){
            let lv=data.getCache<number>("attributeLv",this.lvLabels.children[i].name);
            this.lvLabels.children[i].getComponent(cc.Label).string=lv==10?"Max":`Lv${lv}`;
            this.upgradeBtns.children[i].active=lv==10?false:true;
        }
    }
    back() {
        this.node.destroy();
    }
    watchAdUpgrade(event: cc.Event.EventTouch) {
        let target: cc.Node = event.target;
        let type = target.getComponent(cc.Button).clickEvents[0].customEventData;
        ad.video_show().then(isok=>{
            if(isok){
                this.upgrade(type);
            }
        });
    }
    upgrade(type:string){
        let lv=data.getCache<number>("attributeLv",type)+1;
        lv=lv>10?10:lv;
        data.updateCache("attributeLv",type,lv);
        this.init();
    }
}
