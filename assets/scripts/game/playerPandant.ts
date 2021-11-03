// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import playerController from "./playerController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerPandant extends cc.Component {

    animation:cc.Animation=null;
    player:cc.Node=null;
    playerControl:playerController=null;

    distanceX:number=80;
    distanceY:number=80;
    isInit:boolean=false;

    onLoad(){
        this.animation=this.node.getComponent(cc.Animation);
    }

    start () {

    }
    init(){
        this.playerControl=this.player.getComponent(playerController);
        this.node.setPosition(this.player.x-this.distanceX,this.player.y+this.distanceY);
        this.node.active=true;
        this.isInit=true;
    }
    update (dt) {
        if(this.isInit){
            this.follow();
        }
    }
    follow(){
        let newPos=cc.v3(0,this.player.y+this.distanceY);
        if(this.playerControl.skeleton.node.scaleX>0){
            newPos.x=this.player.x-this.distanceX;
        }else{
            newPos.x=this.player.x+this.distanceX;
        }
        this.node.position=this.node.position.lerp(newPos,0.1);
    }
}
