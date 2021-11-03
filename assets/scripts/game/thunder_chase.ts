// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import enemyHitCollider from "./enemyHitCollider";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class thunder_chase extends cc.Component {

    damage:number=0;
    isOpenCollider:boolean=false;
    interval:number=0.2;
    isCD:boolean=false;
    player:cc.Node=null;
    // onLoad () {}

    start () {
        this.scheduleOnce(()=>{
            this.isOpenCollider=true;
            if(this.player!=null && this.isCD==false){
                this.hit();
            }
        },0.5);
        this.scheduleOnce(()=>{
            this.isOpenCollider=false;
        },2);
        this.scheduleOnce(()=>{
            this.node.destroy();
        },2.5);
    }

    onCollisionEnter(other:cc.Collider,self:cc.Collider){
        //if(this.isOpenCollider==false ||this.isCD) return;
        if(other.node.group=="player"){
            this.player=other.node;
            this.hit();
        }
    }
/*     onCollisionStay(other:cc.Collider,self:cc.Collider){
        if(this.isOpenCollider==false ||this.isCD) return;
        if(other.node.group=="player"){
            this.hit();
        }
    } */
    onCollisionExit(other:cc.Collider,self:cc.Collider){
        //if(this.isOpenCollider==false ||this.isCD) return;
        if(other.node.group=="player"){
            this.player=null;
        }
    }
    hit(){
        if(this.isOpenCollider==false||GameManager.instance.playerController.thunder_chase_cd){
            this.scheduleOnce(()=>{
                if(this.player==null) return;
                this.hit();
            },this.interval);
            return;
        }
        this.enterCD();
        this.playerEnterCd();
        this.node.getComponent(enemyHitCollider).hit(this.node,this.damage);
        this.scheduleOnce(()=>{
            if(this.player==null) return;
            this.hit();
        },this.interval);
    }
    enterCD(){
        this.isCD=true;
        this.scheduleOnce(()=>{
            this.isCD=false;
        },this.interval);
    }
    playerEnterCd(){
        GameManager.instance.playerController.thunder_chase_cd=true;
        this.scheduleOnce(()=>{
            GameManager.instance.playerController.thunder_chase_cd=false;
        },this.interval);
    }
}
