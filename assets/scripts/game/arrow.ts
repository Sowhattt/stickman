// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import playerController from "./playerController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class arrow extends cc.Component {

    force:number=1800;
    speedX:number=0;
    speedY={num:0};
    damage:number=0;
    a:number=0;
    enemy:cc.Node=null;
    isHit:boolean=false;
    isTweenEnd:boolean=false;
    rigibody:cc.RigidBody=null;
    time:number=0;
    playerPosition:cc.Vec2=null;

    onLoad(){
        this.rigibody=this.node.getComponent(cc.RigidBody);
    }
    start(){
        let direct=caijiTools.getDirection(this.node.angle+90).normalizeSelf();
        this.speedX=direct.x*this.force;
        this.speedY.num=direct.y*this.force;
        this.time=Math.abs(this.playerPosition.x-this.node.x)/Math.abs(this.speedX);
        this.time=this.time<0.15?this.time-0.06:this.time-0.09;
        this.a=this.speedY.num*2/this.time;//v1=v0-at
        cc.tween(this.speedY)
        .to(this.time,{num:-this.speedY.num})
        .call(()=>{
            this.isTweenEnd=true;
        })
        .start();

    }
    update(dt){
        if(this.isHit) return;
        if(this.isTweenEnd){
            this.speedY.num-=this.a*dt*0.9;
        }
        this.rigibody.linearVelocity=cc.v2(this.speedX,this.speedY.num);
        let linearVelocity=this.rigibody.linearVelocity;
        let angle=caijiTools.getAngleDependY(linearVelocity.x,linearVelocity.y);
        this.node.angle=-angle-90;
    }
    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        if(other.node.group=="player"){
            if(this.isHit) return;
            this.isHit=true;
            other.node.getComponent(playerController).beHit(this.enemy,this.damage);
        }
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        if (other.group == "ground") {
            this.isHit=true;
            this.Destroy();
            this.rigibody.linearVelocity=cc.v2(this.rigibody.linearVelocity.x*0.3,this.rigibody.linearVelocity.y*0.3);
            this.scheduleOnce(()=>{
                this.rigibody.linearVelocity=cc.v2(0,0);
                this.rigibody.type=cc.RigidBodyType.Static;
            },0);
        }
    }
    Destroy(){
        this.scheduleOnce(()=>{
            cc.tween(this.node)
            .to(0.3,{opacity:0})
            .call(()=>{
                this.node.destroy();
            })
            .start();
        },1);
    }
}
