
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "./caijiTools";
import { data } from "./sdk/data";


const { ccclass, property } = cc._decorator;

@ccclass
export default class dontDestroy extends cc.Component {


    private static _instance: dontDestroy;
    public static get instance() {
        if (this._instance == null) {
            this._instance = new dontDestroy;
        }
        return this._instance;
    }
    loadingPanel:cc.Node=null;
    times: number = 120;//增加体力间隔
    Timer: number = 0;//当前倒计时
    nowPower: number = 0; //当前体力
    maxPower: number = 5;  //自增体力上限
    isTimer: boolean = false;//是否正在倒计时
    min: number = 0;
    sec: number = 0;
    rainBowData={
        istart:false,
        timerMax:300,
        timer:300
    }

    onLoad() {
        this.Timer = this.times;
    }

    start() {
        cc.game.addPersistRootNode(this.node);
        this.schedule(() => {
            let date = new Date();
            let time = date.getTime() / 1000;
            data.updateCache("Base", "exitTime", time);  //保存退出游戏时的时间
        }, 1);
    }
    async getLoadingPanel(){
        let prefab=await caijiTools.loadPrefab("prefab/loading");
        dontDestroy.instance.loadingPanel=cc.instantiate(prefab);
        dontDestroy.instance.loadingPanel.setParent(cc.find("dontDestroy"));
        dontDestroy.instance.loadingPanel.setPosition(cc.winSize.width/2,cc.winSize.height/2);
        dontDestroy.instance.loadingPanel.children[0].setContentSize(cc.winSize);
    }
    checkPowerIsFull(){
        this.nowPower = Number(data.getCache("Base", "power"));
        if(dontDestroy.instance.isTimer==false){
            if (this.nowPower < this.maxPower) {
                dontDestroy.instance.isTimer=true;
                this.startTimer();
            }
            return;
        }
        if (this.nowPower >= this.maxPower) {
            this.unschedule(this.scheduleFun);
            dontDestroy.instance.isTimer=false;
        }
    }
    startTimer() {
        dontDestroy.instance.min = 0;
        dontDestroy.instance.min = 0;
        this.Timer = this.times;
        this.unschedule(this.scheduleFun);
        this.schedule(this.scheduleFun, 1, this.times);
    }
    scheduleFun() {
        this.Timer = this.Timer - 1;
        dontDestroy.instance.min = Math.floor(this.Timer / 60);
        dontDestroy.instance.sec = this.Timer % 60;
        if (this.Timer == 0) {
            this.nowPower++;
            data.updateCache("Base", "power", this.nowPower);
            this.Timer = this.times;
            if (this.nowPower < this.maxPower) {
                this.startTimer();
            }
            else {
                this.Timer = this.times;
                dontDestroy.instance.isTimer = false;
            }
        }
    }
    rainBowSchedule(){
        if(dontDestroy.instance.rainBowData.istart==true) return;
        dontDestroy.instance.rainBowData.istart=true;
        dontDestroy.instance.rainBowData.timer=dontDestroy.instance.rainBowData.timerMax;
        this.schedule(()=>{
            dontDestroy.instance.rainBowData.timer--;
        },1,dontDestroy.instance.rainBowData.timerMax-1);
    }
}
