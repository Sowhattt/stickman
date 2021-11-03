// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import uiBase from "../uiBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class choseLevelPanel extends uiBase{

    @property(cc.Prefab)
    levelItem:cc.Prefab=null;
    @property(cc.Node)
    layouts:cc.Node[]=[];

    levelNum:number=15;
    nowPage:number=1;
    maxPage:number=0;
    onLoad () {
        this.initUi();
    }

    start () {
        this.init();
    }
    init(){
        this.maxPage=Math.ceil(this.levelNum/8);
        for(let j=0;j<this.maxPage;j++){
            let num=(this.levelNum-j*8)>=8?8:this.levelNum-j*8;
            for(let i=1;i<=num;i++){
                let levelItem=cc.instantiate(this.levelItem);
                levelItem.setParent(this.layouts[j]);
                levelItem.name=(i+j*8).toString();
                levelItem.active=true;
            }
        }
    }
    next(){
        if(this.nowPage==this.maxPage) return
        this.layouts[this.nowPage-1].active=false;
        this.nowPage++;
        this.layouts[this.nowPage-1].active=true;
    }
    last(){
        if(this.nowPage==1) return;
        this.layouts[this.nowPage-1].active=false;
        this.nowPage--;
        this.layouts[this.nowPage-1].active=true;
    }
    close(){
        this.node.destroy();
    }
}
