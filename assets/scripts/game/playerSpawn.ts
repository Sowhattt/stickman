// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import GameManager from "./GameManager";
import playerController from "./playerController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerSpawn extends cc.Component {

    onLoad(){
        GameManager.instance.playerSpawnM=this;
    }
    start(){
    }
    async spawnPlayer(){
        let pre=await caijiTools.loadPrefab("prefabs/player");
        let player=cc.instantiate(pre);
        player.setParent(this.node.parent);
        player.setPosition(this.node.position);
        player.setSiblingIndex(this.node.getSiblingIndex());
        GameManager.instance.player = player;
        GameManager.instance.playerController=player.getComponent(playerController);
        player.active=true;
    }
}
