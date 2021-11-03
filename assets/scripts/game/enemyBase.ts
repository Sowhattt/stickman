// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import { data } from "../sdk/data";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;
export enum enemyAttribute{
    hp="hp",
    damage="damage",
    dropCoinNumber="dropCoinNumber",
    isSuperArmor="isSuperArmor"
}
@ccclass
export default class enemyBase extends cc.Component {

    hpMax: number = 0;
    swordRainHitCd: number = 0.1;
    damage:number=0;
    isSuperArmor: boolean = false;//是否霸体
    isWuDi:boolean=false;

    initData(){
        let level=Number(data.getCache("Base","choseLevel"));
        let difficult=Number(data.getCache("levelStar",(level).toString()));
        let hpTimes=Number(data.gameJson("enemyHpTimes",difficult.toString()));
        let damageTimes=Number(data.gameJson("enemyDamageTimes",difficult.toString()));
        this.swordRainHitCd=Number(data.gameJson("swordRainInterval"));
        this.hpMax=Number(data.gameJson("enemyData",this.node.name,enemyAttribute.hp));
        this.damage=Number(data.gameJson("enemyData",this.node.name,enemyAttribute.damage));
        this.isSuperArmor=data.gameJson("enemyData",this.node.name,enemyAttribute.isSuperArmor);
        this.hpMax*=hpTimes;
        this.damage*=damageTimes;
    }
    dieCount(){
        GameManager.instance.killEnemyCount();
    }
    playBeHitSound(audioName:string){
        if(this.isWuDi) return;
        audioManager.playAudio(audioName);
    }
}
