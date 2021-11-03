// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class FX_E10 extends cc.Component {

    skeleton:sp.Skeleton=null;

    onLoad () {
        this.skeleton=this.node.children[1].getComponent(sp.Skeleton);
    }

    start () {
        for(let i =0;i<4;i++){
            //@ts-ignore
            this.skeleton._skeleton.slots[i].color["a"]=0;
        }
    }

}
