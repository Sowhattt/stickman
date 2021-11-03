// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { ad } from "../sdk/ad";
import { data } from "../sdk/data";
import coinDrop from "./coinDrop";
import damageTipPool from "./damageTipPool";
import enemySpawn from "./enemySpawn";
import Events from "./Events";
import playerController from "./playerController";
import playerSpawn from "./playerSpawn";
import uiManager from "./ui/uiManager";

const {ccclass, property} = cc._decorator;
enum MapName{
    Map1_bambooForest1,
    Map2_bambooForest2,
    Map3_OldVillage1,
    Map4_OldVillage2,
    Map5_OldState1,
    Map6_OldState2
}
@ccclass
export default class GameManager extends cc.Component {

    map:cc.Node=null;
    player:cc.Node=null;
    playerController:playerController=null;
    playerSpawnM:playerSpawn=null;
    enemySpawnM:enemySpawn=null;
    needKillEnemyAmount:number=0;
    killEnemyAmoun:number=0;
    dropCoins:cc.Node[]=[];
    static instance:GameManager=null;
    onLoad () {
        GameManager.instance=this;
        damageTipPool.instance.init();
        caijiTools.openPhysicsSystem(0,false);
    }
    onDisable(){
        audioManager.pauseBgGame();
    }
    start () {
        ad.record();
        audioManager.playBgGame();
        this.init();
    }
    init(){
        let level=Number(data.getCache("Base","choseLevel"));
        let mapIndex=Number(data.gameJson("levelData",level.toString(),"map"));
        this.loadMap(MapName[mapIndex]);
        Events.instance.init();
    }
    //计数（击杀怪物）
    killEnemyCount(){
        this.killEnemyAmoun++;
        if(this.killEnemyAmoun==this.needKillEnemyAmount){
            uiManager.ins.win();
        }
    }
    pickUpCoin(){
        for(let coin of this.dropCoins){
            coin.getComponent(coinDrop).startMoveToPlayer();
        }
        this.dropCoins=[];
    }
    async loadMap(mapName:string){
        let pre=await caijiTools.loadPrefab("prefabs/maps/"+mapName);
        this.map=caijiTools.createNode(pre,this.node.parent);
        this.map.setSiblingIndex(this.node.getSiblingIndex());
        uiManager.ins.loadingEnd();
    }
    spawnPlayer(){
        this.playerSpawnM.spawnPlayer();
    }
    createSpawnEnemy(enemyName:string,parent:cc.Node,position:cc.Vec2){
        Events.instance.createSpawnEnemyEffect(enemyName,parent,position);
    }
    spawnEnemy(enemyName:string,parent:cc.Node,position:cc.Vec2){
        Events.instance.spawnEnemy(enemyName,parent,position);
    }
    levelCompletEvent(){
        //解锁当前关下一难度
        let level=Number(data.getCache("Base","choseLevel"));
        let difficulty=Number(data.getCache("levelStar",(level).toString()))+1;
        difficulty=difficulty>3?3:difficulty;
        data.updateCache("levelStar",level.toString(),difficulty);
        //解锁下一关
        if(level==20) return;
        data.updateCache("levelUnlock",level.toString(),1);
    }
}
