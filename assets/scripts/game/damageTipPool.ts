// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "../caijiTools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class damageTipPool extends cc.Component {

    labelPre:cc.Prefab=null;
    effectPre:cc.Prefab=null;
    damgeLabelPool:cc.NodePool=new cc.NodePool("damageLabel");
    damageEffectPool:cc.NodePool=new cc.NodePool("damageEffect");

    private static _instance:damageTipPool=null;
    public static get instance(){
        if(damageTipPool._instance==null){
            damageTipPool._instance=new damageTipPool;
        }
        return damageTipPool._instance;
    }
    async init(){
        if(damageTipPool.instance.damgeLabelPool.size()>0) return;
        damageTipPool.instance.labelPre=await caijiTools.loadPrefab("prefabs/damageLabel");
        damageTipPool.instance.effectPre=await caijiTools.loadPrefab("prefabs/damgeEffect");
        for(let i=0;i<15;i++){
            let effect=cc.instantiate(damageTipPool.instance.effectPre);
            let label=cc.instantiate(damageTipPool.instance.labelPre);
            damageTipPool.instance.damageEffectPool.put(effect);
            damageTipPool.instance.damgeLabelPool.put(label);
        }
    }
    async getDamageLabel(){
        let lable = damageTipPool.instance.damgeLabelPool.get();
        if(!lable){
            lable=cc.instantiate(damageTipPool.instance.labelPre);
        }
        return lable;
    }
    recoveryDmgLabel(node:cc.Node){
        damageTipPool.instance.damgeLabelPool.put(node);
    }
    async getDamageEffect(){
        let effect = damageTipPool.instance.damageEffectPool.get();
        if(!effect){
            effect=cc.instantiate(damageTipPool.instance.effectPre);
        }
        return effect;
    }
    recoveryDmgEffect(node:cc.Node){
        damageTipPool.instance.damageEffectPool.put(node);
    }
}
