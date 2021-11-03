// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import E39controller from "./E39controller";
import enemyHitCollider from "./enemyHitCollider";

const {ccclass, property} = cc._decorator;

@ccclass
export default class E39Laser extends cc.Component {

    @property(cc.Node)
    laserCollider:cc.Node=null;
    @property(E39controller)
    E39:E39controller=null;

    // onLoad () {}

    start () {
        this.laserCollider.getComponent(enemyHitCollider).enemyControl=this.E39;
    }

    // update (dt) {}
}
