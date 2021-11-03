// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class testLabel extends cc.Component {


    // onLoad () {}

    start () {
        this.damageAction();
    }

    damageAction(){
        cc.tween(this.node)
        .by(0.5,{y:120})
        .by(0.2,{opacity:-255,y:60})
        .start();
    }
}
