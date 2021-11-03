// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import skillPool from "./skillPool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class swordSmoke extends cc.Component {


    tween(){
        let scaleOffset=Math.random()*0.4;
        this.node.scale=caijiTools.random_int(60,100)/100;
        cc.tween(this.node)
        .by(0.03,{scale:scaleOffset})
        .by(0.05,{opacity:-255})
        .call(()=>{
            skillPool.instance.recoverySwordSmoke(this.node);
        })
        .start();
    }
    reuse(){
    }
    unuse(){
        this.node.opacity=255;
        this.node.active=false;
    }
}
