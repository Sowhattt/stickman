// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import { data } from "../sdk/data";
import { attackType, enemyScript } from "./animationState";
import playerHp from "./ui/playerHp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class swordRainCollider extends cc.Component {

    damage: number = 0;
    interval: number = 0;
    enemyTemp: cc.Node[] = [];

    onEnable() {
        this.damage = playerHp.instance.damageSowrdRain;
        this.interval = Number(data.gameJson("swordRainInterval"));
    }
    start() {
        this.scheduleOnce(() => {
            this.schedule(this.hit, this.interval);
        }, 0.2);
    }

    hit() {
        for (let enemy of this.enemyTemp) {
            //@ts-ignore
            enemy.getComponent(enemyScript[enemy.name]).beHit(this.damage, attackType.swordRain);
            //@ts-ignore
            //enemy.getComponent(enemyScript[enemy.name]).playBeHitSound(audioName.slash2);
        }
    }
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.enemyTemp.includes(other.node)) return;
        this.enemyTemp.push(other.node);
    }
    onCollisionExit(other: cc.Collider, self: cc.Collider) {
        let index = this.enemyTemp.indexOf(other.node);
        this.enemyTemp.splice(index, 1);
    }
}
