// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import { data } from "../sdk/data";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class coinDrop extends cc.Component {

    coinNumer:number=1;
    targetPosition:cc.Vec3=null;
    isPickUpTime:boolean=false;
    rigibody:cc.RigidBody=null;
    circleCollider:cc.PhysicsCircleCollider=null;
    speed:number=1200;
    isDropFloor:boolean=false;

    onLoad () {
        this.rigibody=this.node.getComponent(cc.RigidBody);
        this.circleCollider=this.node.getComponent(cc.PhysicsCircleCollider);
    }
    start () {
        GameManager.instance.dropCoins.push(this.node);
        this.addForce();
        this.scheduleOnce(()=>{
            this.startMoveToPlayer();
        },1.5);
    }

    addForce(){
        let force_x=caijiTools.random_int(-60,60)*150;
        let force_y=caijiTools.random_int(30,60)*150;
        this.rigibody.applyForceToCenter(cc.v2(force_x,force_y),true);
    }
    startMoveToPlayer(){
        this.isPickUpTime=true;
        this.closeDamping();
    }
    update (dt) {
        if(this.isPickUpTime){
            this.moveToPlayer();
        }
    }
    lateUpdate(){
        if(this.rigibody.linearVelocity.len()<10){
            if(this.circleCollider.restitution==0) return;
            this.rigibody.linearVelocity=cc.v2(0,0);
            this.circleCollider.restitution=0;
            this.circleCollider.apply();
        }
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        if (other.group == "ground") {
            this.openDamping();
        }else if(other.group=="player"){
            contact.disabled=true;
        }
    }
    addCoin(){
        let coin=Number(data.getCache("Base","coin"))+this.coinNumer;
        data.updateCache("Base","coin",coin);
    }
    moveToPlayer(){
        this.targetPosition=cc.v3(GameManager.instance.player.x,GameManager.instance.player.y+70)
        let direct=this.targetPosition.sub(this.node.position).normalizeSelf();
        this.rigibody.linearVelocity=cc.v2(direct.x*this.speed,direct.y*this.speed);
        let len=this.targetPosition.sub(this.node.position).len();
        if(len<15){
            this.addCoin();
            this.node.active=false;
            this.node.destroy();
        }
    }
    openDamping(){
        if(this.isDropFloor) return;
        this.isDropFloor=true;
        this.rigibody.linearDamping=2;
        this.rigibody.angularDamping=2;
    }
    closeDamping(){
        this.rigibody.linearDamping=0;
    }
}
