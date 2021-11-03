// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import skillPool from "./skillPool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class thunder_burstParent extends cc.Component {

    @property(cc.Prefab)
    thunderBallPrefab:cc.Prefab=null;


    speed:number=500;
    numer:number=0;
    wave:number=0;
    direction:Array<cc.Vec2>=[
        cc.v2(-0.31, 0.95),cc.v2(-0.81, 0.59),cc.v2(-1.00, 0.00),
        cc.v2(1.00, -0.00),cc.v2(0.81, 0.59),cc.v2(0.31, 0.95),
    ];
/*     direction:Array<cc.Vec2>=[
        cc.v2(-0.31, 0.95),cc.v2(-0.81, 0.59),cc.v2(-1.00, 0.00),cc.v2(-0.81, -0.59),cc.v2(-0.31, -0.95),
        cc.v2(0.31, -0.95),cc.v2(0.81, -0.59),cc.v2(1.00, -0.00),cc.v2(0.81, 0.59),cc.v2(0.31, 0.95),
    ]; */
    // onLoad () {}

    start () {
        audioManager.playAudio(audioName.E27StormBurst);
        this.createThunderBallRound();
        this.scheduleOnce(()=>{
            this.node.destroy();
        },10);
    }
    createThunderBallRound(){
        this.wave++;
        for(let i=0;i<6;i++){
            this.getThunderBall();
        }
        this.speed*=(0.7-this.wave/10);
        if(this.wave<3){
            this.scheduleOnce(()=>{
                this.createThunderBallRound();
            },0.2);
        }
    }
    getThunderBall(){
        let ball=skillPool.instance.getThunderBall();
        ball.setParent(this.node);
        ball.setPosition(0,0);
        ball.setSiblingIndex(1);
        ball.active=true;
        let index=this.numer%6;
        ball.getComponent(cc.RigidBody).linearVelocity=
        cc.v2(this.direction[index].x*this.speed,this.direction[index].y*this.speed);
        this.numer++;
    }
}
