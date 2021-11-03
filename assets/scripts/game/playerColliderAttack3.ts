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
export default class playerColliderAttack3 extends cc.Component {

    enemys: Array<cc.Node> = [];
    enemysHadHit: Array<cc.Node> = [];
    onDisable() {
        this.enemys = [];
        this.enemysHadHit = [];
    }
    hit(enemy: cc.Node, damgeScale: number, attackType: attackType) {
        //@ts-ignore
        enemy.getComponent(enemyScript[enemy.name]).beHit(damgeScale, attackType);
        //@ts-ignore
        enemy.getComponent(enemyScript[enemy.name]).playBeHitSound(audioName.slash3);
    }
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.enemysHadHit.includes(other.node)) return;
        let dmg: number = playerHp.instance.damageScale * GameManager.instance.playerController.damageScaleZoom *
            GameManager.instance.playerController.damage3ScaleTimes;
        this.hit(other.node, dmg, attackType.attack3);
        this.enemysHadHit.push(other.node);
    }
    onCollisionExit(other: cc.Collider, self: cc.Collider) {
        let index = this.enemys.indexOf(other.node);
        this.enemys.splice(index, 1);
    }
}
