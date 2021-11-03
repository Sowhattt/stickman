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
    attack,
    bomb
}
@ccclass
export default class E29controller extends enemyBase{

    atlas:cc.SpriteAtlas=null;
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

    moveSpeed: number = 110;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.6;//ai间隔
    stopDistance:number=100;//停止距离
    hp: number = 0;
    hpTimes:number=1;//血量倍数
    beHitForce_y: number = 25000;//手里剑攻击作用力
    beHitForce_x: number = 20000//普通攻击作用力
    beHitForce_y_shuriken: number = 50000//普通攻击作用力
    beHitForce_x_attack3: number = 330000;//被击飞作用力
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
    alpha={
        number:0
    };

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
        this.AI_interval+=Math.random();
        this.AI_start();
    }
    update() {
        if(this.enemyAnimation.state==enemyState["Head-middle"]){
            this.setColor([1.0,0.0,0.0,this.alpha.number]);
        }
        if (this.isMove == false) return;
        let distance = this.getDistanceX();
        if (Math.abs(distance) < this.stopDistance) {
            this.hit();
        } else {
            if(this.enemyAnimation.state==enemyState.Atk) return;
            this.moveToPlayer();
        }
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        // let worldManifold = contact.getWorldManifold();
        // let normal = worldManifold.normal;
        if (other.group == "ground") {
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
        if(this.dmgCollider==null||this.dmgCollider==damageCollider.bomb) return;
        this.skeleton.node.children[this.dmgCollider].active=false;
        this.dmgCollider=null;
    }
    AI_start() {
        if(GameManager.instance.playerController.isDie){
            //玩家已死 停止移动d
            this.scheduleOnce(()=>{
                this.AI_start();
            },1);
            return;
        }
        let distance = Math.abs(this.getDistanceX());
        if (distance < this.stopDistance) {
            this.hit();
        } else {
            this.changeDirection();
            this.enemyAnimation.changeState(enemyState.Move, 1.1, true);
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
        if(this.isDie) return;
        this.changeMovState(false);
        this.setLinearDamping(0);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.Idle, 1, true, true);
        this.scheduleOnce(() => {
            if(this.enemyAnimation.state!=enemyState.Idle) return;
            this.AI_start();
        }, this.AI_interval);
    }
    changeDirection() {
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        this.hpNode.x = this.skeleton.node.scaleX > 0 ? 8 : -8;
    }
    die() {
        this.unscheduleAllCallbacks();
        this.isDie = true;
        this.hideHp();
        this.closeHighLight();
        this.setRigibodySpeed(0,0);
        this.node.getComponent(cc.BoxCollider).enabled=false;
        this.enemyAnimation.changeState(enemyState.Die,1,false,true);
        this.scheduleOnce(()=>{
            this.rigibody.type=cc.RigidBodyType.Static;
        },0);
        this.dieCount();
        this.scheduleOnce(()=>{
            audioManager.playAudio(audioName.E29Explosion);
        },0.1);
    }
    //头缩放
    head_middle(){
        this.startRedColor();
        this.showDamageCollider(damageCollider.bomb);
        this.enemyAnimation.changeState(enemyState["Head-middle"],1.2,true,true);
        this.scheduleOnce(this.head_end,2.3);
        cc.tween(this.alpha)
        .repeat(2,
            cc.tween()
            .to(0.65,{number:0.7},{easing:"sineOut"})
            .to(0.65,{number:0},{easing:"sineIn"})
            )
        .start();
    }
    //头爆炸
    head_end(){
        this.closeHighLight();
        this.enemyAnimation.changeState(enemyState["Head-end"],1.3,false,true);
        this.scheduleOnce(()=>{
            if(!this.getDamageCollider()) return;
            this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
        },0.45);
    }
    Destroy(){
        this.node.destroy();
    }
    getUp() {
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state==enemyState["Knock-up-end"]){
                this.enemyAnimation.changeState(enemyState["Get-up"], 1, false, true);
            }
        },0.3);

    }
    moveToPlayer() {
        this.rigibody.linearVelocity=cc.v2(this.nowSpeed,0);
    }
    hit() {
        if(enemyState[this.enemyAnimation.state].includes("Hit")) return;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        this.showDamageCollider(damageCollider.attack);
        this.enemyAnimation.changeState(enemyState.Atk, 1, false);
        audioManager.playAudio(audioName.E29Attack);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state==enemyState.Atk){
                this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
                this.scheduleOnce(()=>{
                    if(this.enemyAnimation.state==enemyState.Atk){
                        this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
                    }
                },0.8);
            }
        },1.1);
    }
    beHit(damage: number, dmgType: attackType) {
        if(this.isDie ) return;
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
    knockDownLoop(){
        this.enemyAnimation.changeState(enemyState["Knock-up-loop"],1,false,true);
    }
    knockDownEnd(){
        this.enemyAnimation.changeState(enemyState["Knock-up-end"],1,false,true);
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
                state = enemyState.Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.attack2:
                state = enemyState.Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.attack3:
                this.setLinearDamping(0);
                this.scheduleOnce(() => {
                    this.setLinearDamping(5);
                }, 0.2);
                state = enemyState["Knock-up-start"];
                if (this.node.x < GameManager.instance.player.x && GameManager.instance.playerController.skeleton.node.scaleX < 0) {
                    this.applyForce(cc.v2(-this.beHitForce_x_attack3, this.beHitForce_y_attack3));
                } else if (this.node.x > GameManager.instance.player.x && GameManager.instance.playerController.skeleton.node.scaleX > 0) {
                    this.applyForce(cc.v2(this.beHitForce_x_attack3, this.beHitForce_y_attack3));
                }
                break;
            case attackType.jumpHit:
                state = enemyState.Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x, 0));
                break;
            case attackType.shuriken:
                state = enemyState.Hit;
                this.applyForce(cc.v2(GameManager.instance.player.x > this.node.x ? -this.beHitForce_x : this.beHitForce_x,
                    this.beHitForce_y_shuriken));
                break;
            case attackType.swordRain:
                state = enemyState.Hit;
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
    //头部变大闪红
    startRedColor(){
        this.skeleton.getMaterial(0).setProperty("beHit", 1);
        this.skeleton.getMaterial(0).setProperty("highLightColor", [1.0,0.0,0.0,0.0]);
    }
    setColor(color:Array<number>){
        this.skeleton.getMaterial(0).setProperty("highLightColor",color);
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