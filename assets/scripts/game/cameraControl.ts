// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class cameraControl extends cc.Component {

    cameraNode:cc.Node=null;
    mainCamera:cc.Camera=null;
    offsetX:number=0;//相机移动条件:与玩家X轴相差临界值

    y_min:number=-200;
    y_max:number=90;
    static instance:cameraControl=null;
    onLoad () {
        cameraControl.instance=this;
        this.cameraNode=this.node;
        this.offsetX=0;//cc.winSize.width/2*0.4;
        this.mainCamera=this.node.getComponent(cc.Camera);
    }

    start () {     

    }

    update (dt) {
        if(GameManager.instance.playerController==null) return;
        let worldPos_player=GameManager.instance.player.parent.convertToWorldSpaceAR(GameManager.instance.player.position);
        let nodePos_player=this.node.parent.convertToNodeSpaceAR(worldPos_player);
        this.changeCameraX(nodePos_player);
    }
    changeCameraY(screenPos:cc.Vec2,nodePos_player){
        let newY=0;
        if((screenPos.y-320)>70){
            newY=nodePos_player.y-70;
            newY=newY>this.y_max?this.y_max:newY;
            this.node.y=cc.misc.lerp(this.node.y,newY,0.05);
        }else if(screenPos.y<250){
            newY=nodePos_player.y+70;
            newY=newY<this.y_min?this.y_min:newY;
            this.node.y=cc.misc.lerp(this.node.y,newY,0.1);
        }
    }
    changeCameraX(nodePos_player){
        if(Math.abs(nodePos_player.x-this.node.x)>=this.offsetX){
            if((this.node.x<=0&&this.node.x>nodePos_player.x)||
            (this.node.x>=this.maxOffsetX[0]&&this.node.x<nodePos_player.x)){
                return;
            }
            let newX=nodePos_player.x>this.node.x?nodePos_player.x-this.offsetX:nodePos_player.x+this.offsetX;
            this.node.x=cc.misc.lerp(this.node.x,newX,0.1);
        }
    }
    getPlayerPosInBuildCamera(player:cc.Node):cc.Vec2{
        let screenPos=new cc.Vec2();
        let toWorldPos = player.parent.convertToWorldSpaceAR(player.getPosition()); 
        this.mainCamera.getWorldToScreenPoint(toWorldPos,screenPos); 
        return screenPos;
    }
    changeCameraView(time:number,position:cc.Vec3,zoomRatio:number){
        cc.tween(this.node)
        .to(time,{position:position},{easing:"sineOut"})
        .start();
        cc.tween(this.mainCamera)
        .to(time,{zoomRatio:zoomRatio},{easing:"sineOut"})
        .start();
    }

    maxOffsetX:number[]=[
        1300,50,1000,0,320,250,250,800,450,0,
        1000,1100,650,1000,1000,1000,0,1100,1800,1100
    ];
}
