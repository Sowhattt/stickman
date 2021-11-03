// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { caijiTools } from "./caijiTools";
import { ad } from "./sdk/ad";
import { data } from "./sdk/data";

const {ccclass, property} = cc._decorator;

@ccclass
export default class initLoading extends cc.Component {

    successNum:number=0;
    bundleName:string[]=["mainUi","prefabs","game","sp_enemy","sp_others","sp_player","sounds"];

    actionTime:number=1;
    version:string="1.0.1";

    start () {
        data.init(true).then(()=>{
            this.addNewData();
            this.unlockAllLevel();
        });
        //ad.init(true);
        this.loadBundle();
    }
    unlockAllLevel(){
        for(let i=0;i<20;i++){
            data.updateCache("levelUnlock",i.toString(),1)
        }
    }
    loadBundle(){
        let self=this;
        for(let name of this.bundleName){
            caijiTools.loadBundlePackage(name,(successName)=>{
                self.successNum++;
                if(self.successNum==self.bundleName.length){
                    if(cc.director.getTotalTime()<1000){
                        this.scheduleOnce(()=>{
                            this.enterMain();
                        },0.5);
                    }else{
                        this.enterMain();
                    }
                }
            });
        }
    }
    enterMain(){
        for(let child of this.node.children){
            if(child.childrenCount!=0){
                cc.tween(child.children[0])
                .to(this.actionTime,{color:cc.color(0,0,0)})
                .start();
            }
            cc.tween(child)
            .to(this.actionTime,{color:cc.color(0,0,0)})
            .start();
        }
        this.scheduleOnce(()=>{
            cc.director.loadScene("main");
        },this.actionTime);
    }
    addNewData(){
        if(data.getCache("Base","version")==this.version) return;
        data.updateCache("Base","version",this.version);
    }
}
