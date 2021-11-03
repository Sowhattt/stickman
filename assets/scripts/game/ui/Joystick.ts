import GameManager from "../GameManager";
import playerController from "../playerController";

const { ccclass, property } = cc._decorator;
@ccclass
export default class JoyStick extends cc.Component {

    @property({
        type: cc.Node,
        displayName: '移动中心节点'
    })
    midNode: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '摇杆背景节点'
    })
    joyBk: cc.Node = null;

    @property({
        displayName: '摇杆活动半径'
    })
    maxR: number = 100;
    zoom: number = 0.3;
/* 
    @property({
        type: cc.Component.EventHandler,
        displayName: '摇杆移动回调',
        tooltip: '触发touchmove后分发数据'
    }) */
    joyCallBack: cc.Component.EventHandler = new cc.Component.EventHandler;

    isKeyTouch_a:boolean=false;
    isKeyTouch_d:boolean=false;
    static instance:JoyStick=null;
    onLoad() {
        JoyStick.instance=this;
        this.goBackMid();

    }
    init(){
        this.joyCallBack.target = GameManager.instance.player;
        this.joyCallBack.component="playerController"
        this.joyCallBack.handler = "move";
        this.binEvent();
    }
    binEvent() {
        this.joyBk.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.joyBk.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.joyBk.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyBk.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.keyUp, this);
    }
    removeEvent() {
        this.joyBk.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.joyBk.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.joyBk.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyBk.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.keyUp, this);
    }

    goBackMid() {
        this.midNode.setPosition(0, 0);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        let pos: cc.Vec2 = this.node.convertToNodeSpaceAR(cc.v2(event.getLocation()));
        pos = cc.v2(pos.x * this.zoom, 0);
        this.clampPos(pos);
        this.midNode.setPosition(pos);
        this.joyCallBack.emit([pos]);
    }

    onTouchMove(event: cc.Event.EventTouch) {
        let pos: cc.Vec2 = this.node.convertToNodeSpaceAR(cc.v2(event.getLocation()));
        pos = cc.v2(pos.x * this.zoom, 0);
        this.clampPos(pos);
        this.midNode.setPosition(pos);
        this.joyCallBack.emit([pos]);
    }

    onTouchEnd(e: cc.Event.EventTouch) {
        this.goBackMid();
        this.joyCallBack.emit([cc.v2(0, 0)]);
    }
    keyDown(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.isKeyTouch_a=true;
                this.midNode.setPosition(-40,0);
                this.joyCallBack.emit([cc.v2(-1,0)]);
                break;
            case cc.macro.KEY.d:
                this.isKeyTouch_d=true;
                this.midNode.setPosition(40,0);
                this.joyCallBack.emit([cc.v2(1,0)]);
                break;
        }
    }
    keyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                if(this.isKeyTouch_d){
                    this.isKeyTouch_a=false;
                    this.isKeyTouch_d=true;
                    this.midNode.setPosition(40,0);
                    this.joyCallBack.emit([cc.v2(1,0)]);
                    return;
                } 
                this.isKeyTouch_a=false;
                this.goBackMid();
                this.joyCallBack.emit([cc.v2(0,0)]);
                break;
            case cc.macro.KEY.d:
                if(this.isKeyTouch_a){
                    this.isKeyTouch_d=false;
                    this.isKeyTouch_a=true;
                    this.midNode.setPosition(-40,0);
                    this.joyCallBack.emit([cc.v2(-1,0)]);
                    return;
                } 
                this.isKeyTouch_d=false;
                this.goBackMid();
                this.joyCallBack.emit([cc.v2(0,0)]);
                break;
        }
    }
    /**
     * 根据半径限制位置
     * @param pos 
     */
    clampPos(pos: cc.Vec2) {
        let len: number = pos.mag();
        if (len > this.maxR) {
            let k: number = this.maxR / len;
            pos.x *= k;
            pos.y *= k;
        }
    }

    /**
     * 根据位置转化角度
     * @param pos 
     */
    couvertToAngle(pos: cc.Vec2) {
        let r: number = Math.atan2(pos.y, pos.x);
        let d: number = cc.misc.radiansToDegrees(r);
        return d;
    }

    // update (dt) {}
}
