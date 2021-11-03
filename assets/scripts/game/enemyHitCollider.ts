// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { enemyName } from "./animationState";
import playerController from "./playerController";
import { bossName } from "./ui/bossHp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class enemyHitCollider extends cc.Component {

    enemyControl:any=null;
    player:cc.Node=null;

    onDisable () {
        this.player=null;
    }
    hit(enemy:cc.Node,dmg:number,isKnockDown:boolean=false){
        if(this.player){
            this.player.getComponent(playerController).beHit(enemy,dmg,isKnockDown);
        } 
    }
    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        if(other.node.group=="player"){
            this.player=other.node;
            if(this.enemyControl!=null){
                if(this.enemyControl.node.name==bossName.enemy10){
                    this.enemyControl.hit_rush();
                }else if(this.enemyControl.node.name==enemyName.bigSquid){
                    this.enemyControl.hit();
                }else if(this.enemyControl.node.name==bossName.enemy39){
                    this.enemyControl.laserHit();
                }else if(this.enemyControl.node.name==enemyName.enemy18){
                    this.enemyControl.hit();
                }
            }
        }
    }
    onCollisionExit(other:cc.Collider,self:cc.Collider){
        this.player=null;
    }
}
