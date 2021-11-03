// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import skillPool from "./skillPool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class rock extends cc.Component {



    tween(){
        for(let child of this.node.children){
            child.scale=0.3+caijiTools.random_int(-10,10)/100;
            let x=caijiTools.random_int(-500,500)/10;
            let y=caijiTools.random_int(-500,500)/10
            child.setPosition(x,y);
            let direction=cc.v2(x,y).normalizeSelf();
            let force=1200;
            this.scheduleOnce(()=>{
                child.getComponent(cc.RigidBody).applyForceToCenter(cc.v2(direction.x*force,direction.y*force),true);
            },0);
            this.scheduleOnce(()=>{
                cc.tween(child)
                .to(0.3,{scale:0})
                .start();
            },0.5);
        }
        this.scheduleOnce(()=>{
            skillPool.instance.recoveryRock(this.node);
        },2);
    }
    reuse(){
    }
    unuse(){
    }
}
