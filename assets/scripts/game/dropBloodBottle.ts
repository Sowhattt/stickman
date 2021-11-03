// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "./GameManager";
import playerHp from "./ui/playerHp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class dropBloodBottle extends cc.Component {

    hp:number=100;
    forceX:number=30000;
    forceY:number=20000;
    rigibody:cc.RigidBody=null;
    isMoveToPlayer:boolean=false;
    speed:number=500;
    targetPosition:cc.Vec3=null;

    onLoad(){
        this.rigibody=this.node.getComponent(cc.RigidBody);
    }
    start () {
        this.forceX=this.node.x>GameManager.instance.player.x?this.forceX:-this.forceX;
        this.rigibody.applyForceToCenter(cc.v2(this.forceX,this.forceY),false);
    }
    update(){
        if(this.isMoveToPlayer){
            this.moveToPlayer();
        }
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        if (other.group == "ground") {
            this.rigibody.linearVelocity=cc.v2(0,0);
        }else if(other.group=="player"&&other.name=="player"){
            if(GameManager.instance.playerController.isDie) return;
            contact.disabled=true;
            this.isMoveToPlayer=true;
        }
    }
    moveToPlayer(){
        this.targetPosition=cc.v3(GameManager.instance.player.x,GameManager.instance.player.y+70)
        let direct=this.targetPosition.sub(this.node.position).normalizeSelf();
        this.rigibody.linearVelocity=cc.v2(direct.x*this.speed,direct.y*this.speed);
        let len=this.targetPosition.sub(this.node.position).len();
        if(len<10){
            this.addHp();
            this.node.active=false;
            this.node.destroy();
        }
    }
    addHp(){
        this.rigibody.enabledContactListener=false;
        playerHp.instance.addHp(this.hp);
        this.node.destroy();
    }
}
