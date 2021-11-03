import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import firePillarCollider from "./firePillarCollider";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;
enum damageCollider{
    attack
}
@ccclass
export default class E20controller extends enemyBase {

    @property(cc.Prefab)
    firePillar:cc.Prefab=null;
    @property(cc.Prefab)
    tpFx_start:cc.Prefab=null;
    @property(cc.Prefab)
    tpFx_end:cc.Prefab=null;
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

    moveSpeed: number = 80;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.8;//ai间隔
    stopDistance:number=400;//停止距离
    hp: number = 0;
    hpTimes:number=1;//血量倍数
    beHitForce_y: number = 35000;//手里剑攻击作用力
    beHitForce_x: number = 25000//普通攻击作用力
    beHitForce_y_shuriken: number = 50000//普通攻击作用力
    beHitForce_x_attack3: number = 400000;//被击飞作用力
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
    isTPCD:boolean=false;//被攻击自动tp冷却

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
        this.idle();
    }
    update() {
        if (this.isMove == false) return;
        let distance = this.getDistanceX();
        if (Math.abs(distance) < this.stopDistance) {
            this.skill_start();
        } else {
            if(this.enemyAnimation.state==enemyState.attack) return;
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
        if(this.dmgCollider==null) return;
        this.skeleton.node.children[this.dmgCollider].active=false;
        this.dmgCollider=null;
    }
    AI_start() {
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
            if(distance>150){
                this.skill_start();
            }else{
                this.teleportStart();
            }
        } else {
            let random=caijiTools.random_int(1,10);
            if(random%2==0){
                this.skill_start();
                return;
            }
            this.changeDirection();
            this.enemyAnimation.changeState(enemyState.move, 1, true,true,true);
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
        this.changeMovState(false);
        this.changeDirection();
        this.setLinearDamping(0);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.idle, 1, true,true,true);
        this.scheduleOnce(() => {
            if(this.enemyAnimation.state!=enemyState.idle) return;
            this.AI_start();
        }, this.AI_interval);
    }
    changeDirection() {
        if(GameManager.instance.player==null) return;
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        this.isDie = true;
        this.node.active = false;
        this.hideHp();
        this.dieCount();
    }
    moveToPlayer() {
        this.rigibody.linearVelocity=cc.v2(this.nowSpeed,0);
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true);
    }
    knockDown2(){
        this.enemyAnimation.changeState(enemyState.knock_down2, 1, false, true);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state!=enemyState.knock_down2) return;
            this.getUp();
        },0.5);
    }
    skill_start(){
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.fire_pillar, 1, false, true,true);
    }
    //持续施法中  无法打断
    skill_middle(){
        audioManager.playAudio(audioName.E20Cast);
        this.openSuperArmor();
        this.enemyAnimation.changeState(enemyState.fire_pillar2, 1, true, true);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state!=enemyState.fire_pillar2) return;
            this.skill_end();
        },2.5);
        //施法
        this.schedule(()=>{
            if(this.enemyAnimation.state!=enemyState.fire_pillar2) return;
            this.createFirePillar(GameManager.instance.player.position);
        },0.8,2,0.001);
    }
    skill_end(){
        this.closeSuperArmor();
        this.enemyAnimation.changeState(enemyState.fire_pillar3, 1, false, true);
    }
    //创建火柱
    createFirePillar(pos){
        let fire=cc.instantiate(this.firePillar);
        fire.setParent(this.node.parent);
        fire.setSiblingIndex(this.node.getSiblingIndex());
        fire.setPosition(pos.x,-194);
        fire.getComponent(firePillarCollider).damage=this.damage;
        fire.active=true;
    }
    //传送隐身
    blink(trackEntry,event){
        if(event.data.name=="Blink"){
            this.closeCollider();
            this.createFX();
        }else{
            this.transportEnd();
        }
    }
    //传送动作开始
    teleportStart(){
        this.isTPCD=true;
        this.openSuperArmor();
        this.enemyAnimation.changeState(enemyState.teleport, 1, false, true,true);
        this.scheduleOnce(()=>{
            audioManager.playAudio(audioName.BlinkStart);
        },0.2);
    }
    //传送至指定地点
    transportEnd(){
        audioManager.playAudio(audioName.BlinkEnd);
        let x=0;
        if(GameManager.instance.player.x<700){
            x=GameManager.instance.player.x+caijiTools.random_int(300,cc.winSize.width/1.6);
        }else if(GameManager.instance.player.x>1700){
            x=GameManager.instance.player.x-caijiTools.random_int(300,cc.winSize.width/1.6);
        }else{
            let random=caijiTools.random_int(1,10);
            x=random%2==0?
            GameManager.instance.player.x+caijiTools.random_int(-cc.winSize.width/1.6,-300):
            GameManager.instance.player.x+caijiTools.random_int(300,cc.winSize.width/1.6);
        }
        this.node.x=x;
        this.createFX();
        this.scheduleOnce(()=>{
            this.closeSuperArmor();
            this.openCollider();
        },0.2);
    }
    createFX(){
        let fx=cc.instantiate(this.tpFx_start);
        fx.setParent(this.node.parent);
        fx.setSiblingIndex(this.node.getSiblingIndex()+1);
        fx.setPosition(this.node.x,this.node.y+this.damageLabelOffsetY);
        fx.active=true;
    }
    hit() {
        if(enemyState[this.enemyAnimation.state].includes("get_hurt")) return;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        this.showDamageCollider(damageCollider.attack);
        this.enemyAnimation.changeState(enemyState.attack, 1, false);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state==enemyState.attack){
                this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
            }
        },0.5);
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
    openSuperArmor(){
        this.isSuperArmor=true;
    }
    closeSuperArmor(){
        this.isSuperArmor=false;
    }
    closeCollider(){
        this.node.opacity=0;
        this.boxCollider.enabled=false;
        this.boxCollider.apply();
        this.node.getComponent(cc.BoxCollider).enabled=false;
        this.hideHp();
    }
    openCollider(){
        this.node.opacity=255;
        this.boxCollider.enabled=true;
        this.boxCollider.apply();
        this.node.getComponent(cc.BoxCollider).enabled=true;
    }
    setRigibodySpeed(x:number,y:number=0){
        this.rigibody.linearVelocity=cc.v2(x,y);
    }
    changeState_beHit(dmgType: attackType) {
        if(this.isSuperArmor) return;
        if(this.isTPCD==false){
            this.teleportStart();
            this.scheduleOnce(()=>{
                this.isTPCD=false;
            },5);
            return;
        }
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
