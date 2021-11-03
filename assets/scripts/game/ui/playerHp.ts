// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { data } from "../../sdk/data";
import Events from "../Events";
import GameManager from "../GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerHp extends cc.Component {

    @property(cc.Label)
    hpLabel:cc.Label=null;
    @property(cc.ProgressBar)
    hpBar:cc.ProgressBar=null;
    @property(cc.Node)
    cursor:cc.Node=null;//血条光标
    @property(cc.Node)
    bar:cc.Node=null;

    damageScale: number = 0;//普攻1伤害值 （60,80,150）
    damageShuriken:number=0;//手里剑伤害
    damageSowrdRain:number=0;//剑雨伤害
    hp_max:number=0;
    hp_now:number=0;
    damageLv:number=0;//属性等级
    healthLv:number=0;
    speedLv:number=0;
    damageIncremental:number=0.2;//属性每级递增量
    healthIncremental:number=0.2;
    speedIncremental:number=0.1;
    speedTimes:number=0;
    static instance:playerHp=null;
    onLoad () {
        playerHp.instance=this;
    }

    start () {
        this.init();
    }
    init(){
        this.damageLv=Number(data.getCache("attributeLv","damage"));
        this.healthLv=Number(data.getCache("attributeLv","health"));
        this.speedLv=Number(data.getCache("attributeLv","speed"));
        this.hp_max=Number(data.getCache("Base","playerHp"))*(1+this.healthLv*this.healthIncremental);
        this.damageScale=Number(data.getCache("Base","playerDamage"))*(1+this.damageLv*this.damageIncremental);
        this.damageShuriken=Number(data.getCache("Base","shurikenDamage"))*(1+this.damageLv*this.damageIncremental);
        this.damageSowrdRain=Number(data.getCache("Base","swordRainDamage"))*(1+this.damageLv*this.damageIncremental);
        this.hp_now=this.hp_max;
        this.speedTimes=1+this.speedLv/10;
        this.updateLabel();
    }
    fullHp(){
        this.addHp(this.hp_max-this.hp_now);
    }
    addHp(addNum:number,isRevive:boolean=false){
        addNum=Math.floor(addNum);
        this.hp_now += addNum;
        this.hp_now=this.hp_now>this.hp_max?this.hp_max:this.hp_now;
        this.updateLabel();
        let offsetX=GameManager.instance.playerController.skeleton.node.scaleX>0?-35:35;
        Events.instance.showAddHp_player(GameManager.instance.player,addNum,offsetX,isRevive);
    }
    updateHp(damage: number) {
        damage=Math.floor(damage);
        this.createBarFadeOut();
        this.hp_now -= damage;
        this.hp_now=this.hp_now<0?0:this.hp_now;
        this.updateLabel();
        if (this.hp_now <= 0) {
            this.hp_now = 0;
            GameManager.instance.playerController.die();
        }
    }
    updateLabel(){
        this.hpBar.progress = this.hp_now / this.hp_max;
        this.cursor.x=this.hpBar.progress*300;
        this.hpLabel.string=this.hp_now+"/"+this.hp_max;
    }
    createBarFadeOut(){
        let newBar=cc.instantiate(this.bar);
        newBar.setParent(this.bar.parent);
        newBar.setPosition(this.bar.position);
        cc.tween(newBar)
        .to(0.3,{opacity:0,color:cc.Color.WHITE})
        .call(()=>{
            newBar.destroy();
        })
        .start();
    }
}
