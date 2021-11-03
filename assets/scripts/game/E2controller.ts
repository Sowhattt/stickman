
import { audioName } from "../audioNameMgr";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import Events from "./Events";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;
enum damageCollider{
    attack
}
@ccclass
export default class E2controller extends enemyBase {

    @property({ type: cc.Float, tooltip: "伤害效果x轴偏移值" })
    damageLabelOffsetX: number = 0;
    @property({ type: cc.Float, tooltip: "伤害效果y轴偏移值" })
    damageLabelOffsetY: number = 0;
    @property(cc.Node)
    hpNode: cc.Node = null;
    @property(cc.ProgressBar)
    hpBar: cc.ProgressBar = null;
    @property(cc.String)
    dieEffectName: string = "";
    

    moveSpeed_fast: number = 180;//移动速度
    moveSpeed_slow:number=100;
    nowSpeed: number = 0;//当前速度
    lastSpeed:number=100;//上一次移动速度
    AI_interval: number = 1;//ai间隔
    stopDistance:number=250;//停止距离
    hp: number = 0;
    hpTimes:number=1;//血量倍数
    beHitForce_y: number = 25000;//手里剑攻击作用力
    beHitForce_x: number = 25000//普通攻击作用力
    beHitForce_y_shuriken: number = 50000//普通攻击作用力
    beHitForce_x_attack3: number = 350000;//被击飞作用力
    beHitForce_y_attack3: number = 0;//被击飞作用力
    scaleX_skeleton: number = 0;
    isDie: boolean = false;
    skeleton: sp.Skeleton = null;
    enemyAnimation: enemyAnimation = null;
    rigibody: cc.RigidBody = null;
    boxCollider: cc.PhysicsBoxCollider = null;
    isSwordRainCd: boolean = false;
    isMove: boolean = false;//是否处于移动状态
    dmgCollider:damageCollider=null;
    playerPosition:cc.Vec2=null;

    onLoad() {
        this.lastSpeed=this.moveSpeed_slow;
        this.skeleton = this.node.children[0].getComponent(sp.Skeleton);
        this.scaleX_skeleton = Math.abs(this.skeleton.node.scaleX);
        this.enemyAnimation = this.node.children[0].getComponent(enemyAnimation);
        this.enemyAnimation.enemyController = this;
        this.rigibody = this.node.getComponent(cc.RigidBody);
        this.boxCollider = this.node.getComponent(cc.PhysicsBoxCollider);
    }
    start() {
        this.init();
        //@ts-ignore
        //console.log(this.skeleton.skeletonData._skeletonCache.animations);
    }
    init() {
        this.initData();
        this.hp = this.hpMax*this.hpTimes;
        this.AI_interval+=Math.random();
        this.AI_start();
    }
    update() {
        if (this.isMove == false) return;
        this.farAwayPlayer();
    }
    lateUpdate(){
        if (this.isMove == false) return;
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        // let worldManifold = contact.getWorldManifold();
        // let normal = worldManifold.normal;
        if (other.group == "wall") {
            this.skeleton.node.scaleX=-this.skeleton.node.scaleX;
        }
    }
    showDamageCollider(collider:damageCollider){
        this.skeleton.node.children[collider].active=true;
        this.dmgCollider=collider;
    }
    getDamageCollider(){
        return this.skeleton.node.children[this.dmgCollider];
    }
    hideDamageCollider(){
        if(this.dmgCollider==null) return;
        this.skeleton.node.children[this.dmgCollider].active=false;
        this.dmgCollider=null;
    }
    AI_start() {
        if(GameManager.instance.playerController.isDie){
            //玩家已死 停止移动
            this.scheduleOnce(()=>{
                this.AI_start();
            },1);
            return;
        }
        let distance = Math.abs(this.getDistanceX());
        if (distance > this.stopDistance) {
            this.hit();
        } else {
            this.changeDirection();
            this.changeMovState(true);
            this.nowSpeed =this.lastSpeed==this.moveSpeed_slow?this.moveSpeed_fast:this.moveSpeed_slow;
            let timeScale=this.nowSpeed==this.moveSpeed_fast?2:1;
            this.enemyAnimation.changeState(enemyState.move, timeScale, true);
            this.lastSpeed=this.nowSpeed;
            this.scheduleOnce(()=>{
                if(this.enemyAnimation.state!=enemyState.move) return;
                this.idle();
            },2);
        }
    }
    AI_stop() {
        this.idle();
    }
    changeMovState(isMove: boolean) {
        this.isMove = isMove;
    }
    idle(isComeBackHead:boolean=true) {
        this.changeMovState(false);
        if(isComeBackHead){
            this.comeBackHead();
        }
        this.setLinearDamping(0);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.idle, 1, true, true);
        this.scheduleOnce(() => {
            if(this.enemyAnimation.state!=enemyState.idle) return;
            this.AI_start();
        }, this.AI_interval);
    }
    changeDirection() {
        this.skeleton.node.scaleX = GameManager.instance.player.x >this.node.x ? this.scaleX_skeleton : -this.scaleX_skeleton;
        this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    comeBackHead(){
        this.skeleton.node.scaleX = GameManager.instance.player.x > this.node.x ? -this.scaleX_skeleton : this.scaleX_skeleton;
        this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        this.isDie = true;
        this.node.active = false;
        this.hideHp();
        this.dieCount();
    }
    knockDown2(){
        this.enemyAnimation.changeState(enemyState.knock_down2, 1, false, true)
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true)
    }
    farAwayPlayer(){
        this.nowSpeed=this.skeleton.node.scaleX>0?-Math.abs(this.nowSpeed):Math.abs(this.nowSpeed);
        this.rigibody.linearVelocity=cc.v2(this.nowSpeed,0);
    }
    hit() {
        if(enemyState[this.enemyAnimation.state].includes("get_hurt")) return;
        this.playerPosition=cc.v2(GameManager.instance.player.position);
        this.comeBackHead();
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.attack, 1, false);
    }
    shootArrow(trackEntry,event){
        if(event.data.name=="Fire"){
            audioManager.playAudio(audioName.E2Shoot);
            let x=this.skeleton.node.scaleX>0?this.node.x-35:this.node.x+35;
            let y=this.node.y+110;
            let angle=this.skeleton.node.scaleX>0?-25:-155;
            Events.instance.createArrow(this.node,cc.v2(x,y),this.playerPosition,angle,this.damage);
        }
    }
    beHit(damage: number, dmgType: attackType) {
        this.changeMovState(false);
        this.setRigibodySpeed(0);
        // let isContinue = this.checkIsSwordRain(dmgType);//设置剑雨攻击间隔
        // if (isContinue == 0) return;
        this.highLight();
        this.showHp();
        this.changeState_beHit(dmgType);
        let x = this.node.scaleX < 0 ? this.node.x + this.damageLabelOffsetX : this.node.x - this.damageLabelOffsetX;
        let y = this.node.y + this.damageLabelOffsetY;
        Events.instance.showDamageLabel_enemy(this.node, damage, cc.v2(x, y));
        this.updateHp(damage);
        if (this.hp <= 0) {
            Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
        }
    }
    setRigibodySpeed(x:number,y:number=0){
        this.rigibody.linearVelocity=cc.v2(x,y);
    }
    changeState_beHit(dmgType: attackType) {
        if(this.isSuperArmor) return;
        let state = null;
        let isKnockDown = dmgType == attackType.attack3 ? true : false;
        switch (dmgType) {
            case attackType.attack1:
                state = enemyState.get_hurt2;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.attack2:
                state = enemyState.get_hurt1;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.attack3:
                this.setLinearDamping(0);
                this.scheduleOnce(() => {
                    this.setLinearDamping(5);
                }, 0.4);
                state = enemyState.knock_down1;
                if (this.node.x < GameManager.instance.player.x && GameManager.instance.playerController.skeleton.node.scaleX < 0) {
                    this.applyForce(cc.v2(-this.beHitForce_x_attack3, this.beHitForce_y_attack3));
                } else if (this.node.x > GameManager.instance.player.x && GameManager.instance.playerController.skeleton.node.scaleX > 0) {
                    this.applyForce(cc.v2(this.beHitForce_x_attack3, this.beHitForce_y_attack3));
                }
                break;
            case attackType.jumpHit:
                state = enemyState.get_hurt1;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.shuriken:
                state = enemyState.get_hurt1;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x,
                    this.beHitForce_y_shuriken));
                break;
            case attackType.swordRain:
                state = enemyState.get_hurt1;
                break;
            default:
        }
        this.enemyAnimation.changeState(state, 1, false, isKnockDown);
    }
    setLinearDamping(damping: number) {
        this.rigibody.linearDamping = damping;
    }
    setFriction(friction: number = 0) {
        this.boxCollider.friction = friction;
        this.boxCollider.apply();
    }
    applyForce(force: cc.Vec2) {
        if (this.isSuperArmor) return;
        this.rigibody.applyForceToCenter(force, true);
    }
    checkIsSwordRain(dmgType: attackType) {
        if (dmgType == attackType.swordRain) {
            if (this.isSwordRainCd) return 0;
            this.isSwordRainCd = true;
            this.scheduleOnce(() => {
                this.isSwordRainCd = false;
            }, this.swordRainHitCd);
        }
        return 1;
    }
    updateHp(damage: number) {
        this.hp -= damage;
        this.hpBar.progress = this.hp / this.hpMax;
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }
    showHp() {
        this.unschedule(this.hideHp);
        this.hpNode.active = true;
        this.scheduleOnce(this.hideHp,2);
    }
    hideHp() {
        this.hpNode.active = false;
    }
    highLight() {
        this.unschedule(this.closeHighLight);
        this.skeleton.getMaterial(0).setProperty("beHit", 1);
        this.skeleton.getMaterial(0).setProperty("highLightColor", [1.0,1.0,1.0,0.5]);
        this.scheduleOnce(this.closeHighLight, 0.15);
    }
    closeHighLight() {
        this.skeleton.getMaterial(0).setProperty("beHit", 0);
    }
    getDistanceX() {
        return this.node.x - GameManager.instance.player.x;
    }
}
