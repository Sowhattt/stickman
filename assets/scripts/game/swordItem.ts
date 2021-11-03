// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyScript } from "./animationState";
import GameManager from "./GameManager";
import rock from "./rock";
import skillPool from "./skillPool";
import swordSmoke from "./swordSmoke";
import playerHp from "./ui/playerHp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class swordItem extends cc.Component {

    isRight:boolean=false;
    isDestory:boolean=false;
    rightAngle:number=138;
    leftAngle:number=42;
    offsetX:number=74;
    offsetY:number=-67;
    movex1:number=0;
    movey1:number=0;
    movex2:number=0;
    movey2:number=0;
    damage:number=0;
    enemysHadHit: Array<cc.Node> = [];
    onLoad () {
        this.movex1=this.offsetX*0.3;
        this.movey1=this.offsetY*0.3;
        this.movex2=this.offsetX*5;
        this.movey2=this.offsetY*5;
    }
    onEnable(){

    }
    init(){
        this.movex1=this.isRight?Math.abs(this.movex1):-Math.abs(this.movex1);
        this.movex2=this.isRight?Math.abs(this.movex2):-Math.abs(this.movex2);
    }
    tween () {
        //cc.v2(74,67);
        this.init();
        let scaleXOffset:number=caijiTools.random_int(50,60)/10;
        this.node.angle=this.isRight?this.rightAngle:this.leftAngle;
        cc.tween(this.node)
        .by(0.04,{scale:1})
        .by(0.12,{position:cc.v3(this.movex1,this.movey1)})
        .parallel(
            cc.tween().by(0.1,{scaleX:scaleXOffset},{easing:"sineIn"}),
            cc.tween().by(0.1,{scaleY:-0.5,position:cc.v3(this.movex2,this.movey2)})
        )
        .start();
        this.scheduleOnce(()=>{
            skillPool.instance.recoverySword1(this.node);
        },0.25);
    }
/*     onBeginContact (contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider) {
        let other=otherCollider.node;
        let pos=contact.getWorldManifold();
        contact.disabled=true;
        if (other.group == "ground") {
            //落地
            if(this.isDestory) return;
            this.isDestory=true;
            this.createSmoke(pos.points[0],other);
        }else if(other.group=="enemy"){
            //击中敌人
            if(this.enemysHadHit.includes(other)) return;
            //@ts-ignore
            other.getComponent(enemyScript[other.name]).beHit(this.damage, attackType.swordRain);
            this.enemysHadHit.push(other);
        }
    } */
    createSmoke(collidePos:cc.Vec2,ground:cc.Node){
        let smoke=skillPool.instance.getSwordSmoke();
        let nodePos=this.node.parent.parent.convertToNodeSpaceAR(collidePos);
        nodePos.x=nodePos.x+caijiTools.random_int(-300,100)/10;
        nodePos.y=nodePos.y+caijiTools.random_int(100,500)/10;
        smoke.setParent(this.node.parent.parent);
        smoke.setSiblingIndex(ground.getSiblingIndex()-1);
        smoke.setPosition(nodePos);
        smoke.getComponent(swordSmoke).tween();
        smoke.active=true;
        this.createRock(nodePos);
        skillPool.instance.recoverySword1(this.node);
    }
    createRock(pos:cc.Vec2){
        let rockNode=skillPool.instance.getRock();
        rockNode.setParent(this.node.parent.parent);
        rockNode.setPosition(pos);
        rockNode.getComponent(rock).tween();
        rockNode.setSiblingIndex(rockNode.getSiblingIndex()-1);
        rockNode.active=true;
    }
    reuse(){
        cc.Tween.stopAllByTarget(this.node);
        this.isDestory=false;
    }
    unuse(){
        this.node.scale=0;
        this.enemysHadHit=[];
    }
}
