// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import { ad } from "../sdk/ad";
import { data } from "../sdk/data";
import { uiName } from "../uiBase";
import audioManager from "./audioManager";
const {ccclass, property} = cc._decorator;

@ccclass
export default class mainMenu extends cc.Component {

    @property(cc.Node)
    mask_go:cc.Node=null;
    @property(cc.Node)
    mask_enter:cc.Node=null;
    @property(cc.Label)
    coinLabel:cc.Label=null;

    static ins:mainMenu=null;
    onLoad () {
        mainMenu.ins=this;
    }

    start () {
        this.init();
    }
    init(){
        this.maskAction_enter();
        this.updateCoin(this.coinLabel);
    }
    maskAction_go(){
        this.mask_go.x=cc.winSize.width/2;
        this.mask_go.width=cc.winSize.width+1064;
        this.mask_go.active=true;
        let offsetX=this.mask_go.scaleX*this.mask_go.width;
        cc.tween(this.mask_go)
        .by(0.6,{x:-offsetX})
        .call(()=>{
            cc.director.loadScene("game");
        })
        .start()
    }
    maskAction_enter(){
        this.mask_enter.x=-cc.winSize.width/2;
        this.mask_enter.width=cc.winSize.width+1064;
        this.mask_enter.active=true;
        let offsetX=this.mask_enter.scaleX*this.mask_enter.width;
        cc.tween(this.mask_enter)
        .by(0.6,{x:offsetX})
        .start()
    }
    async openUpgradePanel(){
        let popup=await caijiTools.showPopup(uiName.upgradePanel,this.node);
        popup.setSiblingIndex(this.node.childrenCount-3);
    }
    async openSignInPanel(){
        let popup=await caijiTools.showPopup(uiName.signInPanel,this.node);
        popup.setSiblingIndex(this.node.childrenCount-3);
    }
    async choseLevel(){
        let popup=await caijiTools.showPopup(uiName.choseLevelPanel,this.node);
        popup.setSiblingIndex(this.node.childrenCount-3);
    }
    startGame(){
        this.maskAction_go();
        let levelUnlock=data.getCache<number[]>("levelUnlock");
        for(let i=0;i<levelUnlock.length;i++){
            if(levelUnlock[i]==0){
                if(i>=16){
                    data.updateCache("Base","choseLevel",15);
                }else{
                    data.updateCache("Base","choseLevel",i);
                }
                break;
            }
        }
    }
    updateCoin(coinLabel:cc.Label){
        let coin=Number(data.getCache("Base","coin"));
        if(coin>=1000){
            coinLabel.string=(coin/1000).toFixed(1)+"k";
        }else{
            coinLabel.string=coin.toString();
        }
    }
    watchAdGetCoin(){
        ad.video_show().then(isok=>{
            if(isok){
                audioManager.playAudio(audioName.getCoin);
                let coin=Number(data.getCache("Base","coin"))+500;
                data.updateCache("Base","coin",coin);
                this.updateCoin(this.coinLabel);
            }
        });
    }
    checkTodayDate() {
        let timeDate = new Date();
        let maxPower=12;
        if (timeDate.toLocaleDateString() != data.getCache("Base","todayDate")) {
            if (Number(data.getCache("Base","power")) <maxPower) {
            }
            data.updateCache("Base","todayDate",timeDate.toLocaleDateString());
            data.updateCache("Base","isGetDailyReward",0);//是否已领签到奖励
            data.updateCache("Base","isGetLoginReward",0);//是否已领登录奖励
            let loginDays=Number(data.getCache("Base","loginDays"));
            data.updateCache("Base","loginDays",loginDays+1);//登录天数
            this.checkHadSign();
        }else{
            this.checkHadSign();
        }
    }
    checkHadSign() {
        if (Number(data.getCache("Base","isGetDailyReward")) == 0) {
            this.openSignInPanel();
        }
    }
}
