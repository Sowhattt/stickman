import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;
enum damageCollider{
    fall,
    bomb
}
@ccclass
export default class spiderlingController extends enemyBase {

    @property(cc.Prefab)
    landingFx:cc.Prefab=null;
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

    moveSpeed: number = 150;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.2;//ai间隔
    stopDistance:number=30;//停止距离
    hp: number = 0;
    hpTimes:number=1;//血量倍数
    beHitForce_y: number = 0;//手里剑攻击作用力
    beHitForce_x: number = 0//普通攻击作用力
    beHitForce_y_shuriken: number = 0//普通攻击作用力
    beHitForce_x_attack3: number = 100000;//被击飞作用力
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
    isWarning:boolean=false;
    isWuDi:boolean=true;
    warn_a={
        a:0
    }

    onLoad() {
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
        this.enemyAnimation.changeState(enemyState.Fall,1,false);
        this.showDamageCollider(damageCollider.fall);
        audioManager.playAudio(audioName.E40Start);
    }
    update() {
        this.warningAnimation();
        if (this.isMove == false) return;
        let distance = this.getDistanceX();
        if (Math.abs(distance) < this.stopDistance) {
            this.idle();
        } else {
            if(this.enemyAnimation.state==enemyState.attack) return;
            this.moveToPlayer();
        }
    }
    warningAnimation(){
        if(this.isWarning){
            //@ts-ignore
            this.skeleton._skeleton.slots[4].color["a"]=this.warn_a.a;
        }
    }
    startWarning(){
        audioManager.playAudio(audioName.E40Alert,false,0.6);
        this.skeleton.setAttachment("Untitled-4","Untitled-4");
        this.isWarning=true;
        cc.tween(this.warn_a)
        .repeatForever(
            cc.tween()
            .to(0.1,{a:1})
            .to(0.1,{a:0.1})
        )
        .start();
        this.scheduleOnce(this.die,2.5);
    }
    stopWarn(){
        this.isWarning=false;
        cc.Tween.stopAllByTarget(this.warn_a);
        this.warn_a.a=0;
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        // let worldManifold = contact.getWorldManifold();
        // let normal = worldManifold.normal;
        if (other.group == "wall") {
            contact.disabled=true;
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
        this.changeDirection();
        if(GameManager.instance.playerController.isDie){
            //玩家已死 停止移动
            this.changeMovState(false);
            this.scheduleOnce(()=>{
                this.AI_start();
            },1);
            return;
        }
        let distance = Math.abs(this.getDistanceX());
        if (distance < this.stopDistance) {
            this.idle();
        } else {
            this.changeDirection();
            this.enemyAnimation.changeState(enemyState.Move, 1, true);
            this.changeMovState(true);
            this.nowSpeed = this.skeleton.node.scaleX > 0 ? -this.moveSpeed : this.moveSpeed;
        }
    }
    AI_stop() {
        this.idle();
    }
    changeMovState(isMove: boolean) {
        this.isMove = isMove;
    }
    idle() {
        if(this.enemyAnimation.state!=enemyState.Stop){
            this.enemyAnimation.changeState(enemyState.Stop, 1, true,true);
        }
        this.changeMovState(false);
        //this.changeDirection();
        this.setLinearDamping(0);
        this.setRigibodySpeed(0,0);
        this.scheduleOnce(() => {
            if(this.enemyAnimation.state!=enemyState.Stop) return;
            this.AI_start();
        }, this.AI_interval);
    }
    changeDirection() {
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        if(this.isDie) return;
        audioManager.playAudio(audioName.E40Exposion,false,0.6);
        this.isDie = true;
        this.node.opacity=0;
        this.node.getComponent(cc.BoxCollider).enabled=false;
        this.hideHp();
        this.showDamageCollider(damageCollider.bomb);
        this.unscheduleAllCallbacks();
        cc.Tween.stopAllByTarget(this.node);
        this.scheduleOnce(()=>{
            if(!this.getDamageCollider()) return;
            this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage,true);
        },0);
        let x = this.node.scaleX < 0 ? this.node.x + this.damageLabelOffsetX : this.node.x - this.damageLabelOffsetX;
        let y = this.node.y + this.damageLabelOffsetY;
        Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
        this.scheduleOnce(()=>{
            this.node.destroy();
        },1);
    }
    moveToPlayer() {
        this.rigibody.linearVelocity=cc.v2(this.nowSpeed,0);
    }
    born(){
        audioManager.playAudio(audioName.E40Born);
        this.enemyAnimation.changeState(enemyState.Born, 1, false, true)
    }
    bornComplete(){
        this.isWuDi=false;
        this.idle();
        this.scheduleOnce(this.startWarning,2);
    }
    //落地
    attack_fall(){
        this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
        let fx=caijiTools.createNode(this.landingFx,this.node.parent);
        fx.setSiblingIndex(this.node.getSiblingIndex()+1);
        fx.setPosition(this.node.position);
        fx.active=true;
    }
    Knock_up2(){
        this.enemyAnimation.changeState(enemyState.Knock_up2,1,false,true);
    }
    Knock_up3(){
        this.enemyAnimation.changeState(enemyState.Knock_up3,1,false,true);
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.Get_up, 1, false, true)
    }
    hit() {
        if(enemyState[this.enemyAnimation.state].includes("get_hurt")) return;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        this.showDamageCollider(damageCollider.fall);
        this.enemyAnimation.changeState(enemyState.attack, 1, false);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state==enemyState.attack){
                this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
            }
        },0.5);
    }
    beHit(damage: number, dmgType: attackType) {
        if(this.isWuDi) return;
        this.changeMovState(false);
        this.setRigibodySpeed(0);
        let isContinue = this.checkIsSwordRain(dmgType);//设置剑雨攻击间隔
        if (isContinue == 0) return;
        this.highLight();
        this.showHp();
        this.changeState_beHit(dmgType);
        let x = this.node.scaleX < 0 ? this.node.x + this.damageLabelOffsetX : this.node.x - this.damageLabelOffsetX;
        let y = this.node.y + this.damageLabelOffsetY;
        Events.instance.showDamageLabel_enemy(this.node, damage, cc.v2(x, y));
        if (this.hp <= 0) {
            //Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
        }
        this.updateHp(damage);
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
                state = enemyState.Get_Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.attack2:
                state = enemyState.Get_Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.attack3:
                this.setLinearDamping(0);
                this.scheduleOnce(() => {
                    this.setLinearDamping(5);
                }, 0.4);
                state = enemyState.Knock_up1;
                if (this.node.x < GameManager.instance.player.x && GameManager.instance.playerController.skeleton.node.scaleX < 0) {
                    this.applyForce(cc.v2(-this.beHitForce_x_attack3, this.beHitForce_y_attack3));
                } else if (this.node.x > GameManager.instance.player.x && GameManager.instance.playerController.skeleton.node.scaleX > 0) {
                    this.applyForce(cc.v2(this.beHitForce_x_attack3, this.beHitForce_y_attack3));
                }
                break;
            case attackType.jumpHit:
                state = enemyState.Get_Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.shuriken:
                state = enemyState.Get_Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x,
                    this.beHitForce_y_shuriken));
                break;
            case attackType.swordRain:
                state = enemyState.Get_Hit;
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
