// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import damageTipPool from "./damageTipPool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class damageEffect extends cc.Component {


    onLoad(){
        this.node.getComponent(cc.Animation).on("finished",()=>{
            damageTipPool.instance.recoveryDmgEffect(this.node);
        });
    }
    onEnable () {
        this.node.getComponent(cc.Animation).play();
    }

    reuse(){
        this.node.angle=caijiTools.random_int(0,360);
    }
    unuse(){
        this.node.active=false;
    }
}
