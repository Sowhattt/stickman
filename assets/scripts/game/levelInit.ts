// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import cameraControl from "./cameraControl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class levelInit extends cc.Component {

    @property(cc.Node)
    bgLayers:cc.Node[]=[];

    cameraNode:cc.Node=null;

    onLoad(){
        this.cameraNode=cameraControl.instance.cameraNode;
    }
    start () {

    }

    update (dt) {
        this.bgLayers[0].x=this.cameraNode.position.x*0.8;
        this.bgLayers[1].x=this.cameraNode.position.x*0.75;
        this.bgLayers[2].x=this.cameraNode.position.x*0.62;
        if(this.bgLayers.length==4){
            this.bgLayers[3].x=this.cameraNode.position.x*0.56;
        }
    }
}
