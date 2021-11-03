// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import { data } from "../sdk/data";
import GameManager from "./GameManager";
import spawnEnemy from "./spawnEnemy";

const {ccclass, property} = cc._decorator;

enum enemySpwanData{
    wave="wave",
    amount="amount",
    enemyNames="enemyNames"
}
@ccclass
export default class enemySpawn extends cc.Component {

    nowLevel:number=0;
    difficulty:number=0;
    levelData:any=null;
    waveInterval:number=0;
    wave:number=0;
    amount:number=0;
    enemyNames:string[]=[];
    spawnEnemyIntervalMin:number=0.8;
    spawnEnemyIntervalMax:number=1.5;

    hadSpwanWave:number=0;
    hadSpwanAmount:number=0;
    onLoad () {
        this.init();
    }

    start () {
    }
    init(){
        GameManager.instance.enemySpawnM=this;
        this.nowLevel=Number(data.getCache("Base","choseLevel"));
        this.difficulty=Number(data.getCache("levelStar",this.nowLevel.toString()));
        this.waveInterval=Number(data.gameJson("waveInterval"));
        this.levelData=data.gameJson("levelData",this.nowLevel.toString());
        this.wave=this.levelData["enemySpawn"][enemySpwanData.wave];
        this.amount=this.levelData["enemySpawn"][enemySpwanData.amount];
        this.enemyNames=this.levelData["enemySpawn"][enemySpwanData.enemyNames];
        GameManager.instance.needKillEnemyAmount=this.wave*this.amount[this.difficulty];
    }
    startSpwan(){
        this.hadSpwanWave++;
        this.hadSpwanAmount=0;
        this.scheduleSpawn();
        if(this.hadSpwanWave<this.wave){
            this.scheduleOnce(()=>{
                this.startSpwan();
            },this.waveInterval+this.amount[this.difficulty]*1.5);
        }
    }
    scheduleSpawn(){
        this.hadSpwanAmount++;
        let name=this.enemyNames[caijiTools.random_int(0,this.enemyNames.length-1)];
        this.scheduleOnce(()=>{
            this.spawnEnemy(name);
            if(this.hadSpwanAmount<this.amount[this.difficulty]){
                this.scheduleSpawn();
            }
        },caijiTools.random_int(50,120)/100);
    }
    async spawnEnemy(enemyName:string){
        let pre=await caijiTools.loadPrefab("prefabs/spawnEnemy");
        let spwanEffect=caijiTools.createNode(pre,this.node,false);
        spwanEffect.setSiblingIndex(GameManager.instance.player.getSiblingIndex());
        spwanEffect.getComponent(spawnEnemy).spawnEnemyName=enemyName;
        let x=GameManager.instance.player.x+caijiTools.random_int(-cc.winSize.width/2,cc.winSize.width/2);
        if(x<-300){
            x=GameManager.instance.player.x+caijiTools.random_int(0,cc.winSize.width/2);
        }else if(x>1600){
            x=GameManager.instance.player.x+caijiTools.random_int(-cc.winSize.width/2,0);
        }
        spwanEffect.setPosition(x,-177);
        spwanEffect.active=true;
    }
}
