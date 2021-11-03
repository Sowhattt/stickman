// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

export enum uiName{
    choseLevelPanel="choseLevelPanel",
    losePanel="losePanel",
    winPanel="winPanel",
    wuDiPopup="wuDiPopup",
    fullHpPopup="fullHpPopup",
    doubleDamagePopup="doubleDamagePopup",
    pausePanel="pausePanel",
    upgradePanel="upgradePanel",
    signInPanel="signPanel"
}
export enum bundleName{
    game="game",
    mainUi="mainUi",
    sp_enemy="sp_enemy",
    sp_others="sp_others",
    sp_player="sp_player"
}
@ccclass
export default class uiBase extends cc.Component {


    initUi(){
        this.node.setContentSize(cc.winSize);
        this.node.children[0].setContentSize(cc.winSize);
    }
    creatBloackInput(){
        
    }
}
