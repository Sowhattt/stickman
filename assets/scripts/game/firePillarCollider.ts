// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import enemyHitCollider from "./enemyHitCollider";

const {ccclass, property} = cc._decorator;

@ccclass
export default class firePillarCollider extends cc.Component {

    @property(cc.Node)
    fireSmoke1:cc.Node=null;
    @property(cc.Node)
    fireSmoke2:cc.Node=null;

    damage:number=0;
    interval:number=0.3;//攻击间隔
    enemyHitCollider:enemyHitCollider=null;
    isStay:boolean=false;
    onLoad () {
        this.enemyHitCollider=this.node.getComponent(enemyHitCollider);
    }

    start () {
        audioManager.playAudio(audioName.E20FirePillar,false,0.5);
        this.scheduleOnce(()=>{
            this.fireSmoke2.active=true;
        },0.23);
        this.scheduleOnce(()=>{
            this.fireSmoke1.getComponent(cc.Animation).stop();
            this.fireSmoke2.getComponent(cc.Animation).stop();
            cc.tween(this.fireSmoke1).to(0.1,{opacity:0}).start();
            cc.tween(this.fireSmoke2).to(0.1,{opacity:0}).start();
            this.node.getComponent(cc.BoxCollider).enabled=false;
        },4);
        this.scheduleOnce(()=>{
            this.node.children[1].active=true;
            this.node.children[0].active=false;
            this.node.getComponent(cc.BoxCollider).enabled=true;
        },0.8);
    }
    hit(){
        this.enemyHitCollider.hit(this.node,this.damage);
        this.scheduleOnce(()=>{
            if(this.isStay){
                this.hit();
            }
        },this.interval);
    }
    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        this.isStay=true;
        this.scheduleOnce(()=>{
            this.hit();
        },0);
    }
/*     onCollisionStay(other:cc.Collider,self:cc.Collider){
        if(this.isStay) return;
        this.isStay=true;
        this.schedule(this.hit,this.interval);
        
    } */
    onCollisionExit(other:cc.Collider,self:cc.Collider){
        this.isStay=false;
        //this.unschedule(this.hit);
    }
}
