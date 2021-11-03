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
export default class swordItem2 extends cc.Component {

    isRight:boolean=false;
    rightAngle:number=48;
    leftAngle:number=-48;
    offsetX:number=74;
    offsetY:number=-67;
    isDestory:boolean=false;
    movex1:number=0;
    movey1:number=0;
    movex2:number=0;
    movey2:number=0;
    onLoad () {
        this.movex1=this.offsetX*12;
        this.movey1=this.offsetY*12;
        this.movex2=this.offsetX*0.1;
        this.movey2=this.offsetY*0.1;
    }
    init(){
        this.movex1=this.isRight?Math.abs(this.movex1):-Math.abs(this.movex1);
        this.movex2=this.isRight?Math.abs(this.movex2):-Math.abs(this.movex2);
    }
    tween() {
        //cc.v2(67,74);
        this.init();
        this.node.scaleX=caijiTools.random_int(3,6)/10;
        this.node.scaleY=this.node.scaleX*20;
        this.node.angle=this.isRight?this.rightAngle:this.leftAngle;
        cc.tween(this.node)
        .by(0.1,{position:cc.v3(this.movex1,this.movey1)})
        .start();
        this.scheduleOnce(()=>{
            this.changeColor();
        },0.05);
    }

/*     onBeginContact (contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider) {
        let other=otherCollider.node;
        let pos=contact.getWorldManifold();
        if (other.group == "ground") {
            //落地
            if(this.isDestory) return;
            this.isDestory=true;
            this.changeColor();
        }
    } */
    changeColor(){
        this.node.color=cc.Color.BLACK;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
        .parallel(
            cc.tween().by(0.08,{opacity:-255}),
            cc.tween().by(0.1,{position:cc.v3(this.movex2,this.movey2)})
        )
        .call(()=>{
            skillPool.instance.recoverySword2(this.node);
        })
        .start();
    }
    reuse(){
        this.isDestory=false;
    }
    unuse(){
        this.node.color=cc.Color.WHITE;
        this.node.opacity=255;
    }
}
