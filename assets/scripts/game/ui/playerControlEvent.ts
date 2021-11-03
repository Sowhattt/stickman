// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "../GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerControlEvent extends cc.Component {

    @property(cc.Integer)
    rollCD:number=0;
    @property(cc.Integer)
    skill1CD:number=0;
    @property(cc.Integer)
    skill2CD:number=0;
    @property(cc.Node)
    buttons:cc.Node[]=[];//0-attack 1-roll 2-jump 3-skill1 4-skill2
    
    inited:boolean=false;
    isRollCd:boolean=false;
    isSkill1Cd:boolean=false;
    isSkill2Cd:boolean=false;
    isContinueAttack:boolean=false;
    static instance:playerControlEvent=null;

    onLoad(){
        playerControlEvent.instance=this;
    }
    init(){
        cc.tween(this.node).to(0.5,{opacity:255}).start();
        this.bindingEvent();
    }
    bindingEvent(){
        this.buttons[0].on(cc.Node.EventType.TOUCH_START,this.attack,this);
        this.buttons[0].on(cc.Node.EventType.TOUCH_END,this.attackTouchEnd,this);
        this.buttons[0].on(cc.Node.EventType.TOUCH_CANCEL,this.attackTouchEnd,this);
        this.buttons[1].on(cc.Node.EventType.TOUCH_START,this.roll,this);
        this.buttons[2].on(cc.Node.EventType.TOUCH_START,this.jump,this);
        this.buttons[3].on(cc.Node.EventType.TOUCH_START,this.skill1,this);
        this.buttons[4].on(cc.Node.EventType.TOUCH_START,this.skill2,this);
    }
    removeEvent(){
        this.isContinueAttack=false;
        this.buttons[0].off(cc.Node.EventType.TOUCH_START,this.attack,this);
        this.buttons[0].off(cc.Node.EventType.TOUCH_END,this.attackTouchEnd,this);
        this.buttons[0].off(cc.Node.EventType.TOUCH_CANCEL,this.attackTouchEnd,this);
        this.buttons[1].off(cc.Node.EventType.TOUCH_START,this.roll,this);
        this.buttons[2].off(cc.Node.EventType.TOUCH_START,this.jump,this);
        this.buttons[3].off(cc.Node.EventType.TOUCH_START,this.skill1,this);
        this.buttons[4].off(cc.Node.EventType.TOUCH_START,this.skill2,this);
    }
    attack(){
        this.isContinueAttack=true;
        GameManager.instance.playerController.attack();
    }
    attackTouchEnd(){
        this.isContinueAttack=false;
    }
    roll(event:cc.Event){
        if(this.isRollCd) return;
        this.isRollCd=true;
        GameManager.instance.playerController.roll();

        this.cdAnimation(event.target,this.rollCD);
        this.scheduleOnce(()=>{
            this.isRollCd=false;
        },this.rollCD);
    }
    jump(){
        GameManager.instance.playerController.jump();
    }
    skill1(event:cc.Event){
        if(this.isSkill1Cd) return;
        if(GameManager.instance.playerController.skeleton.animation.includes("skill")) return;
        this.isSkill1Cd=true;
        GameManager.instance.playerController.skill1();

        this.cdAnimation(event.target,this.skill1CD);
        this.scheduleOnce(()=>{
            this.isSkill1Cd=false;;
        },this.skill1CD);
    }
    skill2(event:cc.Event){
        if(this.isSkill2Cd) return;
        if(GameManager.instance.playerController.skeleton.animation.includes("skill")) return;
        this.isSkill2Cd=true;
        GameManager.instance.playerController.skill2();

        this.cdAnimation(event.target,this.skill2CD);
        this.scheduleOnce(()=>{
            this.isSkill2Cd=false;;
        },this.skill2CD);
    }
    cdAnimation(btn:cc.Node,cdTime:number){
        let cdNode:cc.Node=btn.getChildByName("cdNode");
        cdNode.active=true;
        let cdBar:cc.ProgressBar=cdNode.getChildByName("cd").getComponent(cc.ProgressBar);
        let timerLabel:cc.Label=cdNode.getChildByName("timer").getComponent(cc.Label);
        let timeObj={time:cdTime}
        this.timerLabelTween(cdTime,timeObj,timerLabel,cdNode);
        this.progressBarTween(cdBar,cdTime);
    }
    timerLabelTween(cdTime:number,timeObj:object,timerLabel:cc.Label,cdNode:cc.Node){
        cc.tween(timeObj)
        .to(cdTime,{time:0},{
            progress: (start: number, end: number, current: any, t: number) => {
                //start:起始值 end:终点值 current:当前值 t:总时占比0~1 
                //返回值为最终赋值
                let now = cc.misc.lerp(start, end, t);
                timerLabel.string = now.toFixed(1);
                return now;
            }
        })
        .call(()=>{
            cdNode.active=false;
            this.isRollCd=false;
        })
        .start();
    }
    progressBarTween(cdBar:cc.ProgressBar,time:number){
        cc.tween(cdBar)
        .to(time,{progress:1})
        .call(()=>{
            cdBar.progress=0;
        })
        .start();
    }
}
