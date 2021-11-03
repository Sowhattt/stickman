// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class enemyDieEffect extends cc.Component {

    force_x:number=10000;
    force_y:number=17000;
    animation:cc.Animation=null;

    onLoad () {
        this.animation=this.node.getComponent(cc.Animation);
    }
    start(){
        this.play();
        this.scheduleOnce(()=>{
            this.node.destroy();
        },2);
    };
    play(){
        let x=0;
        let y=0;
        this.node.children[0].angle=caijiTools.random_int(0,360);
        this.animation.play();
        for(let child of this.node.children[1].children){
            x=caijiTools.random_int(-50,50)/100;
            y=caijiTools.random_int(30,100)/100;
            let normal=cc.v2(x,y).normalizeSelf();
            let rigibody=child.getComponent(cc.RigidBody);
            rigibody.applyAngularImpulse(caijiTools.random_int(-500,500),false);
            rigibody.applyForceToCenter(cc.v2(normal.x*this.force_x,normal.y*this.force_y),true);
        }
    }

    // update (dt) {}
}
