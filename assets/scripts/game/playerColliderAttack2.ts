// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import { attackType, enemyScript } from "./animationState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class playerColliderAttack2 extends cc.Component {

    enemys: Array<cc.Node> = [];
    enemysHadHit: Array<cc.Node> = [];
    onDisable() {
        this.enemys = [];
        this.enemysHadHit = [];
    }
    hit(damgeScale: number, attackType: attackType) {
        //console.log(damgeScale,attackType);
        audioManager.playAudio(audioName.swoosh2);
        for (let enemy of this.enemys) {
            if (this.enemysHadHit.includes(enemy)) continue;
            //@ts-ignore
            enemy.getComponent(enemyScript[enemy.name]).beHit(damgeScale, attackType);
            this.enemysHadHit.push(enemy);
            //@ts-ignore
            enemy.getComponent(enemyScript[enemy.name]).playBeHitSound(audioName.slash2);
        }
    }
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        this.enemys.push(other.node);
    }
    onCollisionExit(other: cc.Collider, self: cc.Collider) {
        let index = this.enemys.indexOf(other.node);
        this.enemys.splice(index, 1);
    }
}
