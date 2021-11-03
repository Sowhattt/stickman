// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import Events from "./Events";

const {ccclass, property} = cc._decorator;

@ccclass
export default class spawnEnemy extends cc.Component {

    animation:cc.Animation=null;
    spawnEnemyName:string="enemy1";
    enemyHp:number=0;
    isSpawn:boolean=false;

    onLoad () {
        this.animation=this.node.getComponent(cc.Animation);
    }

    start () {
        if(this.spawnEnemyName=="enemy10"){
            this.animation.node.scale=2;
        }
        if(["enemy39","miniBoss","ladyBug","bigSquid","spiderling"].includes(this.spawnEnemyName)){
            this.animation.node.scale=0;
        }
        this.animation.on("finished",()=>{
            this.node.destroy();
        });
        this.animation.getClips()[0].events.push({
            frame:0.14,
            func:"spawnEnemy",
            params:[""]
        });
        this.animation.play();
    }
    spawnEnemy(){
        if(this.isSpawn) return;
        this.isSpawn=true;
        Events.instance.spawnEnemy(this.spawnEnemyName,this.node.parent,cc.v2(this.node.position));
        if(this.animation.node.scale>0){
            audioManager.playAudio(audioName.CreepSpawn);
        }
    }
}
