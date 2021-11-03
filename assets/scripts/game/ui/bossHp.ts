import { caijiTools } from "../../caijiTools";
import { data } from "../../sdk/data";
import { enemyAttribute } from "../enemyBase";

const { ccclass, property } = cc._decorator;
export enum bossName {
    enemy10 = "enemy10",
    enemy39="enemy39",
    miniBoss="miniBoss"
}
@ccclass
export default class bossHp extends cc.Component {

    @property(cc.ProgressBar)
    hpBar: cc.ProgressBar = null;
    @property(cc.Sprite)
    headIcon: cc.Sprite = null;
    @property(cc.Label)
    hpNumLabel: cc.Label = null;
    @property(cc.Node)
    nowHpNode: cc.Node = null;
    @property(cc.Node)
    nextHpNode: cc.Node = null;

    hpMax:number=0;
    barWidth:number=0;
    bossName: string = "";
    hpNum: number = 5;//血条剩余量
    hp: number = 0;//血量
    everyValue: number = 0;//每条血条的血量
    acitonSpeed:number=0.8;//血条削减动画速度
    hpBarShadow:cc.Node=null;//血条削减影子
    hpBarNode:cc.Node=null;//血条
    isLockAction:boolean=false;

    onLoad () {
        this.hpBarShadow=this.nowHpNode.children[0];
        this.hpBarNode=this.nowHpNode.children[1];
    }
    update(){
        this.hpBarShadow.width=cc.misc.lerp(this.hpBarShadow.width,this.hpBarNode.width,0.06);
    }
    init(func) {
        this.barWidth=this.hpBar.totalLength;
        this.hpMax = Number(data.gameJson("enemyData", this.bossName, enemyAttribute.hp));
        this.hp=this.hpMax;
        this.hpNum = 5;
        this.everyValue = this.hp / this.hpNum;
        this.updateHpNum();
        this.updateHeadIcon(func);
        this.updateNowHpBar();
        this.updateNextHpBar();
    }
    updateNowHpBar() {
        this.hpBar.progress=1;
        this.nowHpNode.children[0].width=this.barWidth;
        this.nowHpNode.children[1].width=this.barWidth;
        this.nowHpNode.children[0].color=this.hpBarColor[this.hpNum]["color"];
        this.nowHpNode.children[1].color=this.hpBarColor[this.hpNum]["colorDark"];
    }
    updateNextHpBar() {
        if (this.hpNum == 1) {
            this.nextHpNode.children[0].opacity=0;
        }else{
            this.nextHpNode.children[0].color=this.hpBarColor[this.hpNum-1]["colorDark"];
        }
    }
    addHp(addValue: number) {
        addValue=Math.floor(addValue);
        this.hp += addValue;
        if(this.hp<=0){
            //死亡
            this.hpNumLabel.string ="x0";
            this.hpBarToZeroAction(false);
            return;
        }
        this.hp=this.hp>this.hpMax?this.hpMax:this.hp;
        if(this.isLockAction) return;
        let nowHpNum=Math.ceil(this.hp/this.everyValue);
        if(nowHpNum<this.hpNum){
            this.hpBarToZeroAction(); 
        }else{
            this.hpBarAction();
        }
    }
    //进入下一血条
    enterNextHp() {
        this.isLockAction=false;
        this.hpNum--;
        this.updateHpNum();
        this.updateNowHpBar();
        this.updateNextHpBar();
        this.hpBarAction();
    }
    hpBarAction(){
        cc.Tween.stopAllByTarget(this.hpBar);
        let nowProgress=this.hpBar.progress;
        let toProgress=(this.hp%this.everyValue)/this.everyValue;
        toProgress=toProgress==0?1:toProgress;
        let time=(nowProgress-toProgress)/this.acitonSpeed;
        cc.tween(this.hpBar)
        .to(time,{progress:toProgress},{easing:"quadOut"})
        .start();
    }
    hpBarToZeroAction(isEnterNextHp:boolean=true){
        this.isLockAction=true;
        cc.Tween.stopAllByTarget(this.hpBar);
        let nowProgress=this.hpBar.progress;
        let time=nowProgress/this.acitonSpeed*0.5;
        cc.tween(this.hpBar)
        .to(time,{progress:0},{easing:"quadOut"})
        .call(()=>{
            if(isEnterNextHp==false) return;
            this.enterNextHp();
        })
        .start();
    }
    //增加血条
    increseHpNum(){

    }
    updateHpNum() {
        this.hpNumLabel.string ="x"+ this.hpNum.toString();
    }
    async updateHeadIcon(func) {
        let icon = await caijiTools.loadSpriteFrame("bossHead/" + this.bossName);
        this.headIcon.spriteFrame = icon;
        this.headIcon.node.setPosition(this.headIconPosition[this.bossName]);
        func();
    }
    headIconPosition = {
        "enemy10": cc.v2(-16, -42.5),
        "enemy39": cc.v2(-6, -42.5),
        "miniBoss": cc.v2(-13.4, -60)
    }
    hpBarColor={
        5:{
            color:cc.color(158, 24, 196),
            colorDark:cc.color(99, 0, 127)
        },
        4:{
            color:cc.color(95, 108, 237),
            colorDark:cc.color(0, 12, 129)
        },
        3:{
            color:cc.color(53, 168, 94),
            colorDark:cc.color(18, 94, 45)
        },
        2:{
            color:cc.color(152, 146, 42),
            colorDark:cc.color(113, 108, 27)
        },
        1:{
            color:cc.color(172, 0, 29),
            colorDark:cc.color(113, 0, 19)
        }
    }
}
