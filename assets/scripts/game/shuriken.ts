// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import { attackType, enemyScript } from "./animationState";
import GameManager from "./GameManager";
import playerHp from "./ui/playerHp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class shuriken extends cc.Component {

    damage:number=0;
    speed: number = 2300;
    rigibody: cc.RigidBody = null;
    enemysHadHit: Array<cc.Node> = [];

    onLoad() {
        this.rigibody = this.node.getComponent(cc.RigidBody);
        this.damage=playerHp.instance.damageShuriken;
    }
    start() {
        let speed = GameManager.instance.playerController.skeleton.node.scaleX > 0 ? this.speed : -this.speed;
        this.rigibody.linearVelocity = cc.v2(speed, 0);
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 3);
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        if (other.group == "enemy") {
            //击中敌人
            if(this.enemysHadHit.includes(other)) return;
            //@ts-ignore
            other.getComponent(enemyScript[other.name]).beHit(this.damage, attackType.shuriken);
            this.enemysHadHit.push(other);
            //@ts-ignore
            enemy.getComponent(enemyScript[other.name]).playBeHitSound(audioName.airslash1);
        }
    }
}
