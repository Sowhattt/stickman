// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import damageTipPool from "./damageTipPool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class damageLabel extends cc.Component {

    label:cc.Label=null;
    damage:number=0;
    color:cc.Color=cc.Color.GREEN;

    onLoad(){
        this.label=this.node.getComponent(cc.Label);
    }
    onEnable(){
        this.node.color=this.color;
        if(this.color.g==255&&this.color.r==0){
            this.node.getComponent(cc.Label).string="+"+this.damage.toString();
            this.addHpAciton();
        }else{
            this.node.getComponent(cc.Label).string=this.damage.toString();
            this.damageAction();
        }

    }
    addHpAciton(){
        this.label.fontSize=0;
        this.label.lineHeight=0;
        //this.node.opacity=255;
        cc.tween(this.node)
        .parallel(
            cc.tween().by(0.01,{opacity:255}),
            cc.tween().by(0.5,{y:80})
        )
        .by(0.2,{opacity:-255,y:40})
        .call(()=>{
            damageTipPool.instance.recoveryDmgLabel(this.node);
        })
        .start();
        cc.tween(this.label)
        .to(0.1,{fontSize:32,lineHeight:32})
        .start();
    }
    damageAction(){
        this.node.opacity=255;
        cc.tween(this.node)
        .parallel(
            cc.tween().by(0.4,{y:120}),
            cc.tween().to(0.06,{scale:1.4}).to(0.1,{scale:1})
        )
        .by(0.2,{opacity:-255,y:60})
        .call(()=>{
            damageTipPool.instance.recoveryDmgLabel(this.node);
        })
        .start();
/*         cc.tween(this.label)
        .to(0.06,{fontSize:45,lineHeight:45})
        .to(0.07,{fontSize:32,lineHeight:32})
        .start(); */
    }

    reuse(){
/*         let size=(this.node.color.g==255&&this.color.r==0)?0:32;
        this.label.fontSize=size;
        this.label.lineHeight=size;
        this.node.opacity=255; */
    }
    unuse(){
        cc.Tween.stopAllByTarget(this.node);
        if(this.label==null){
            this.label=this.node.getComponent(cc.Label);
        }
        this.node.scale=0;
/*         this.label.fontSize=0;
        this.label.lineHeight=0; */
        this.node.active=false;
    }
}
