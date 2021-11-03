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

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerColliderJumpHit extends cc.Component {

    @property({type:cc.Float,displayName:"攻击间隔"})
    hitInterval:number=0.15;//攻击间隔
    timer:number=0;
    damageScale:number=0;
    enemys:Array<cc.Node>=[];
    enemysHadHit:Array<cc.Node>=[];
    onDisable () {
        this.timer=0;
        this.enemys=[];
        this.enemysHadHit=[];
    }
    onEnable(){
        this.damageScale=playerHp.instance.damageScale*GameManager.instance.playerController.damageScaleZoom;
    }
    start(){
        this.hitInterval=this.hitInterval-(playerHp.instance.speedTimes-1)/15;
    }
    update(dt){
        this.timer+=dt;
        if(this.timer>=this.hitInterval){
            this.hit(this.damageScale,attackType.jumpHit);
            this.timer=0;
        }
    }
    hit(damgeScale:number,attackType:attackType){
        //console.log(damgeScale,attackType);
        for(let enemy of this.enemys){
            //@ts-ignore
            enemy.getComponent(enemyScript[enemy.name]).beHit(damgeScale,attackType);
            //@ts-ignore
            enemy.getComponent(enemyScript[enemy.name]).playBeHitSound(audioName.airslash1);
        }
    }
    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        this.enemys.push(other.node);
    }
    onCollisionExit(other:cc.Collider,self:cc.Collider){
        let index=this.enemys.indexOf(other.node);
        this.enemys.splice(index,1);
    }
}
