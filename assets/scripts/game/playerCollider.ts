// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import playerController from "./playerController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerCollider extends cc.Component {

    playerController:playerController=null;

    isFlying:boolean=false;

    onLoad () {
        this.playerController=this.node.getComponent(playerController);
    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact (contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider) {
        let other=otherCollider.node;
        // let worldManifold = contact.getWorldManifold();
        // let normal = worldManifold.normal;
        if (other.group == "ground") {
            this.isFlying=false;
            this.playerController.dropToGround();
        }else if(other.group=="wall"){
            contact.setFriction(0);
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (contact:cc.PhysicsContact,selfCollider:cc.PhysicsCollider,otherCollider:cc.PhysicsCollider) {
        let other=otherCollider.node;
        // let worldManifold = contact.getWorldManifold();
        // let normal = worldManifold.normal;
        if (other.group == "ground") {
            this.isFlying=true;
        }
    }

    // 每次将要处理碰撞体接触逻辑时被调用
    // onPreSolve (contact, selfCollider, otherCollider) {
    // }

    // 每次处理完碰撞体接触逻辑时被调用
    // onPostSolve (contact, selfCollider, otherCollider) {
    // }
}
