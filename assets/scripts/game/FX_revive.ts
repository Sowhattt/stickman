// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FX_revive extends cc.Component {

    animation:cc.Animation=null;

    onLoad () {
        this.animation=this.node.getComponent(cc.Animation);
    }

    start () {
    }

    animationFinished(){
        this.createLightFx();
        this.scheduleOnce(()=>{
            this.node.destroy();
        },2);
    }
    async createLightFx(){
        let pre=await caijiTools.loadPrefab("prefabs/fx_reviveLight");
        let fx=cc.instantiate(pre);
        fx.setParent(this.node.parent);
        fx.setPosition(this.node.x,this.node.y+110);
        fx.active=true;
    }
}
