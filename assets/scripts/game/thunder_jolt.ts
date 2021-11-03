// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import cameraControl from "./cameraControl";
import enemyHitCollider from "./enemyHitCollider";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class thunder_jolt extends cc.Component {

    isTurn:boolean=false;

    speed_x:number=300;
    speed_y:number=0;
    speedMax_y:number=300;
    damage:number=0;
    rigibody:cc.RigidBody=null;

    onLoad () {
        this.rigibody=this.node.getComponent(cc.RigidBody);
    }

    start () {

    }
    update(){
        if(this.isTurn){
            this.rigibody.linearVelocity=cc.v2(this.speed_x,this.rigibody.linearVelocity.y);
        }
        if(this.node.y<-500){
            this.node.destroy();
        }
    }
    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        if(other.node.group=="player"){
            this.scheduleOnce(()=>{
                this.node.getComponent(enemyHitCollider).hit(this.node,this.damage);
            },0);
        }
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        if (other.group == "ground") {
            this.playerAudio();
            if(this.isTurn) return;
            this.isTurn=true;
            this.changDirection();
        }else if(other.group == "player"){
            contact.disabled=true;
        }
    }
    playerAudio(){
        let worldPos=this.node.parent.convertToNodeSpaceAR(this.node.position);
        let screenPos=cameraControl.instance.mainCamera.getWorldToScreenPoint(worldPos);
        if(screenPos.x<0&&screenPos.x>-cc.winSize.width){
            audioManager.playAudio(audioName.E27LightningJolt);
        }
    }
    changDirection(){
        this.speed_x=this.node.x>GameManager.instance.player.x?-this.speed_x:this.speed_x;
    }
}
