// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import { data } from "../sdk/data";
import { enemyAttribute } from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import skillPool from "./skillPool";
import { bossName } from "./ui/bossHp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class thunderBall_burst extends cc.Component {

    damage:number=0;
    player:cc.Node=null;

    onLoad () {
        let level=Number(data.getCache("Base","choseLevel"));
        let diff=Number(data.getCache("levelStar",level.toString()));
        let times=Number(data.gameJson("enemyDamageTimes",diff.toString()))
        this.damage=Number(data.gameJson("enemyData",bossName.miniBoss,enemyAttribute.damage))*times;
    }

    onEnable () {
        this.scheduleOnce(()=>{
            if(this.player!=null){;
                this.node.getComponent(enemyHitCollider).hit(this.node,this.damage);
            }
            this.scheduleOnce(()=>{
                skillPool.instance.recoveryThunderball(this.node);
            },1);
        },3.05);
    }
    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        if(other.node.group=="player"){
            this.player=other.node;
        }
    }
    onCollisionExit(other:cc.Collider,self:cc.Collider){
        if(other.node.group=="player"){
            this.player=null;
        }
    }
    reuse(){
    }
    unuse(){
        this.node.active=false;
    }
}
