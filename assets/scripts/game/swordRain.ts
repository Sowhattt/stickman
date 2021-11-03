// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import rock from "./rock";
import skillPool from "./skillPool";
import swordItem from "./swordItem";
import swordItem2 from "./swordItem2";
import swordSmoke from "./swordSmoke";

const {ccclass, property} = cc._decorator;

@ccclass
export default class swordRain extends cc.Component {

    isRight:boolean=false;//朝右
    offsetForward_x1:number=400;//技能方向正偏移
    offsetReverse_x1:number=1500;//技能方向反偏移
    offsetForward_x2:number=500;//技能方向正偏移
    offsetReverse_x2:number=1600;//技能方向反偏移
    duration:number=1.8;

    smokeX_min:number=0;
    smokeX_max:number=0;
    start () {
        if(this.isRight){
            this.smokeX_min=250;
            this.smokeX_max=580;
        }else{
            this.smokeX_max=-250;
            this.smokeX_min=-580;
        }
        if(this.isRight){
            this.node.children[0].active=true;
        }else{
            this.node.children[1].active=true;
        }
        this.schedule(this.createSword,0.06);
        this.scheduleOnce(()=>{
            this.schedule(this.createSword2,0.04);
            this.schedule(this.createSmoke,0.06);
        },0.3);
        this.scheduleOnce(()=>{
            this.destory();
        },this.duration);
    }
    destory(){
        this.unscheduleAllCallbacks();
        cc.tween(this.node)
        .to(0.2,{opacity:0})
        .call(()=>{
            this.node.children[0].active=false;
            this.node.children[1].active=false;
            this.scheduleOnce(()=>{
                this.node.destroy();
            },1);
        })
        .start();
    }
    createSword(){
        for(let i=0;i<2;i++){
            let sword=skillPool.instance.getSword1();
            sword.setParent(this.node);
            sword.setPosition(this.getRandomX_sword1()/10,caijiTools.random_int(-500,1100)/10);
            sword.active=true;
            sword.getComponent(swordItem).isRight=this.isRight;
            sword.getComponent(swordItem).tween();
        }
    }
    createSword2(){
        for(let i=0;i<3;i++){
            let sword2=skillPool.instance.getSword2();
            sword2.setParent(this.node);
            sword2.setSiblingIndex(cc.macro.MIN_ZINDEX);
            sword2.setPosition(this.getRandomX_sword2()/10,caijiTools.random_int(-700,1300)/10);
            sword2.active=true;
            sword2.getComponent(swordItem2).isRight=this.isRight;
            sword2.getComponent(swordItem2).tween();
        }
    }
    getRandomX_sword1(){
        if(this.isRight){
            return caijiTools.random_int(-this.offsetReverse_x1,this.offsetForward_x1);
        }else{
            return caijiTools.random_int(-this.offsetForward_x1,this.offsetReverse_x1);
        }
    }
    getRandomX_sword2(){
        if(this.isRight){
            return caijiTools.random_int(-this.offsetReverse_x2,this.offsetForward_x2);
        }else{
            return caijiTools.random_int(-this.offsetForward_x2,this.offsetReverse_x2);
        }
    }
    createSmoke(){
        let smoke=skillPool.instance.getSwordSmoke();
        let nodePos=cc.v2(0,0);
        nodePos.x=caijiTools.random_int(this.smokeX_min,this.smokeX_max);
        nodePos.y=caijiTools.random_int(-370,-420);
        smoke.setParent(this.node);
        smoke.setPosition(nodePos);
        smoke.getComponent(swordSmoke).tween();
        smoke.active=true;
        this.createRock(nodePos);
    }
    createRock(pos:cc.Vec2){
        let rockNode=skillPool.instance.getRock();
        rockNode.setParent(this.node);
        rockNode.setPosition(pos);
        rockNode.getComponent(rock).tween();
        rockNode.active=true;
    }
}
