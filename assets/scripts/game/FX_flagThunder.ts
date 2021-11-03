// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import enemyHitCollider from "./enemyHitCollider";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FX_flagThunder extends cc.Component {


    damage:number=0;
    // onLoad () {}

    start () {
        this.scheduleOnce(()=>{
            this.node.getComponent(enemyHitCollider).hit(this.node,this.damage);
        },0);
        this.scheduleOnce(()=>{
            this.node.destroy();
        },2);
    }
}
