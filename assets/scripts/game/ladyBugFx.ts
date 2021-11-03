// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import GameManager from "./GameManager";
import playerController from "./playerController";
import portal from "./portal";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ladyBugFx extends cc.Component {

    @property(cc.ParticleSystem)
    liquidParticle:cc.ParticleSystem=null;

    speedX:number=0;
    speedY:number=0;
    damage:number=0;
    isRightMove:boolean=false;//是否朝右
    isCollide:boolean=false;
    rigibody:cc.RigidBody=null;
    onLoad(){
        this.rigibody=this.node.getComponent(cc.RigidBody);
    }
    start(){
        let time=(Math.abs(this.node.y-GameManager.instance.player.y)+40)/this.speedY;
        let distanceX=Math.abs(this.node.x-GameManager.instance.player.x);
        this.speedX=distanceX*3;
        //this.speedX=(Math.abs(this.node.x-GameManager.instance.player.x))/time;
        this.speedX=this.isRightMove==true?this.speedX:-this.speedX;
        this.liquidParticle.angle=this.isRightMove==true?-30:-150;
        this.rigibody.linearVelocity=cc.v2(this.speedX,0);
    }
    hit(player:cc.Node){
        this.createSmoke();
        player.getComponent(playerController).beHit(this.node,this.damage);
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if(this.isCollide) return;
        let other = otherCollider.node;
        if (other.group == "ground") {
            this.createSmoke();
        }else if (other.group=="player"){
            this.hit(other);
        }
    }
    async createSmoke(){
        this.isCollide=true;
        let prefab=await caijiTools.loadPrefab("prefabs/ladyBugSmoke");
        let smoke=caijiTools.createNode(prefab,this.node.parent);
        smoke.setPosition(this.node.position);
        smoke.active=true;
        this.node.destroy();
    }
}
