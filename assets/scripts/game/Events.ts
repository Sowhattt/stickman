// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";
import { data } from "../sdk/data";
import arrow from "./arrow";
import cameraControl from "./cameraControl";
import damageLabel from "./damageLabel";
import damageTipPool from "./damageTipPool";
import { enemyAttribute } from "./enemyBase";
import GameManager from "./GameManager";
import spawnEnemy from "./spawnEnemy";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Events extends cc.Component {

    DropBloodProbability:number=0;
    private static _instance: Events = null;
    public static get instance() {
        if (Events._instance == null) {
            Events._instance = new Events;
        }
        return Events._instance;
    }
    init(){
        Events.instance.DropBloodProbability=Number(data.gameJson("DropBloodProbability"));
    }
    /**
     * 生成怪物降临效果
     */
    async createSpawnEnemyEffect(enemyName:string,parent:cc.Node,position:cc.Vec2){
        let prefab=await caijiTools.loadPrefab("prefabs/spawnEnemy");
        let effect=caijiTools.createNode(prefab,parent);
        effect.setPosition(position);
        effect.getComponent(spawnEnemy).spawnEnemyName=enemyName;
        effect.active=true;
    }
    /**
     * 生成怪物
     */
     async spawnEnemy(enemyName:string,parent:cc.Node,position:cc.Vec2){
        let prefab=await caijiTools.loadPrefab("prefabs/enemys/"+enemyName);
        if(prefab){
            let enemy=caijiTools.createNode(prefab,parent);
            enemy.setPosition(position);
            enemy.setSiblingIndex(GameManager.instance.player.getSiblingIndex());
            enemy.active=true;
        }
    }
    /**
     * 掉落金币
     */
    async dropCoin(target:cc.Node,position:cc.Vec2) {
        let dropNum=Number(data.gameJson("enemyData",target.name,enemyAttribute.dropCoinNumber));
        let coin=await caijiTools.loadPrefab("prefabs/coin_drop");
        for(let i=0;i<dropNum;i++){
            let newCoin=caijiTools.createNode(coin,target.parent);
            newCoin.setPosition(position);
            newCoin.setSiblingIndex(target.getSiblingIndex()+1);
            newCoin.active=true;
        }
    }
    /**
     * 掉落血瓶
     */
    async dropBloodBottle(target:cc.Node,position:cc.Vec2){
        let random=caijiTools.random_int(0,100)/100;
        if(random>Events.instance.DropBloodProbability) return;
        let coin=await caijiTools.loadPrefab("prefabs/dropBloodBottle");
        let bloodBottle=caijiTools.createNode(coin,target.parent);
        bloodBottle.setParent(target.parent);
        bloodBottle.setPosition(position);
        bloodBottle.setSiblingIndex(GameManager.instance.player.getSiblingIndex()+1);
        bloodBottle.active=true;
    }
    /**
     * 玩家增加血量效果
     * @param player 
     * @param addNum 
     * @param offsetX 
     * @param isRevive 
     */
    async showAddHp_player(player: cc.Node, addNum: number, offsetX: number, isRevive: boolean = false) {
        if (isRevive) {
            this.createAddHpEffect_revive();
        } else {
            this.createAddHpEffect_normal();
        }
        let Label = await damageTipPool.instance.getDamageLabel();
        Label.setParent(GameManager.instance.node);
        Label.setPosition(player.x + offsetX, player.y + 80);
        Label.getComponent(damageLabel).damage = addNum;
        Label.getComponent(damageLabel).color = cc.Color.GREEN;
        Label.active = true;
    }
    /**
     * 显示玩家受伤字体
     * @param player 
     * @param damge 
     * @param offsetX 
     */
    async showDamageLabel_player(player: cc.Node, damge: number, offsetX: number) {
        let Label = await damageTipPool.instance.getDamageLabel();
        Label.setParent(GameManager.instance.node);
        Label.setPosition(player.x + offsetX, player.y + 130);
        Label.getComponent(damageLabel).damage = Math.floor(damge);
        Label.getComponent(damageLabel).color = cc.Color.RED;;
        Label.active = true;
    }
    /**
     * 显示怪物受伤字体
     * @param enemy 
     * @param damge 
     * @param position 
     */
    async showDamageLabel_enemy(enemy: cc.Node, damge: number, position: cc.Vec2) {
        this.showDamageEffect(enemy, position);
        let Label = await damageTipPool.instance.getDamageLabel();
        Label.setParent(GameManager.instance.node);
        Label.setPosition(position.x, position.y + 60);
        Label.getComponent(damageLabel).damage = Math.floor(damge);
        Label.getComponent(damageLabel).color = cc.Color.WHITE;;
        Label.active = true;
    }
    /**
     * 玩家攻击效果
     * @param enemy 
     * @param position 
     */
    async showDamageEffect(enemy: cc.Node, position: cc.Vec2) {
        let effect = await damageTipPool.instance.getDamageEffect();
        effect.setParent(GameManager.instance.node.parent);
        effect.setPosition(position);
        effect.active = true;
    }
    /**
     * 怪物死亡效果
     * @param enemy 怪物
     * @param effectName 效果预制体名字
     * @param position 坐标
     * @returns 
     */
    async createEnemyDieEffect(enemy: cc.Node, effectName: string, position) {
        Events.instance.dropCoin(enemy,position);
        Events.instance.dropBloodBottle(enemy,position);
        if (effectName == "") return;
        let pre = await caijiTools.loadPrefab("prefabs/" + effectName);
        let effect = caijiTools.createNode(pre, enemy.parent, false);
        effect.setPosition(position);
        effect.setSiblingIndex(enemy.getSiblingIndex());
        effect.active = true;
    }
    /**
     * 显示复活时回血效果
     */
    async createAddHpEffect_revive() {
        let prefab = await caijiTools.loadPrefab("prefabs/heal");
        let effect = caijiTools.createNode(prefab, GameManager.instance.player);
        effect.setPosition(0, -30);
        effect.active = true;
        this.scheduleOnce(() => {
            if(effect.isValid==false) return;
            effect.destroy();
        }, 2);
    }
    /**
    * 显示普通回血效果
    */
    async createAddHpEffect_normal() {
        let prefab = await caijiTools.loadPrefab("prefabs/addHpEffect");
        let effect = caijiTools.createNode(prefab, GameManager.instance.player);
        effect.setPosition(0, -30);
        effect.active = true;
        this.scheduleOnce(() => {
            if(effect.isValid==false) return;
            effect.destroy();
        }, 2);
    }
    /**
     * 怪物打击玩家效果
     * @param parent 
     * @param position 
     * @param scaleX 
     */
    async showEnemyHitEffect(parent: cc.Node, position: cc.Vec2, scaleX: number) {
        let random = caijiTools.random_int(1, 2);
        let prefab = await caijiTools.loadPrefab("prefabs/enemyHitEffect" + random);
        let effect = caijiTools.createNode(prefab, GameManager.instance.player);
        effect.setParent(parent);
        effect.setPosition(position);
        effect.scaleX = scaleX;
        effect.active = true;
        this.scheduleOnce(() => {
            if(effect.isValid==false) return;
            effect.destroy();
        }, 1);
    }
    /**
     * 生成箭（怪物）
     * @param enemy 
     * @param spawnPosition 
     * @param playerPosition 
     * @param angle 
     * @param damge 
     */
    async createArrow(enemy: cc.Node, spawnPosition: cc.Vec2, playerPosition: cc.Vec2, angle: number, damge: number) {
        let prefab = await caijiTools.loadPrefab("prefabs/arrow");
        let node = caijiTools.createNode(prefab, enemy.parent);
        node.getComponent(arrow).damage = damge;
        node.getComponent(arrow).enemy = enemy;
        node.getComponent(arrow).playerPosition = playerPosition;
        node.setSiblingIndex(enemy.getSiblingIndex());
        node.setPosition(spawnPosition);
        node.angle = angle;
        node.active = true;
    }
    screenShake( repeat: number = 10, offsetX: number = 0, offsetY: number = 20){
        cc.Tween.stopAllByTarget(cameraControl.instance.cameraNode);
        cameraControl.instance.node.y=0;
        caijiTools.screenShake(cameraControl.instance.cameraNode,repeat,offsetX,offsetY);
    }
    async showReviveFx(target:cc.Node){
        let pre=await caijiTools.loadPrefab("prefabs/fx_revive");
        let fx=cc.instantiate(pre);
        fx.setParent(target.parent);
        fx.setSiblingIndex(target.getSiblingIndex()+1);
        fx.setPosition(target.x,target.y-20);
        fx.active=true;
    }
}
