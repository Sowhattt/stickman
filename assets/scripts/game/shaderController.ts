import { caijiTools } from "../caijiTools";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;
enum damageCollider{
    attack,
    skill
}
@ccclass
export default class shaderController extends enemyBase {

    @property(cc.Node)
    smokeFX:cc.Node=null;
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
    AI_interval: number = 0.7;//ai间隔
    stopDistance:number=130;//停止距离
    hp: number = 0;
    hpTimes:number=1;//血量倍数
    beHitForce_y: number = 25000;//手里剑攻击作用力
    beHitForce_x: number = 25000//普通攻击作用力
    beHitForce_y_shuriken: number = 50000//普通攻击作用力
    beHitForce_x_attack3: number = 350000;//被击飞作用力
    beHitForce_y_attack3: number = 0;//被击飞作用力
    scaleX_skeleton: number = 0;
    allowAttackTimes:number=3;//允许连续普通攻击次数
    nowAttackTimes:number=3;//当前连续普通攻击次数
    isDie: boolean = false;
    skeleton: sp.Skeleton = null;
    enemyAnimation: enemyAnimation = null;
    rigibody: cc.RigidBody = null;
    boxCollider: cc.PhysicsBoxCollider = null;
    isSwordRainCd: boolean = false;
    isMove: boolean = false;//是否处于移动状态
    isWuDi:boolean=false;
    dmgCollider:damageCollider=null;
    smokeParticle_Black:cc.ParticleSystem3D=null;
    smokeParticle_Red:cc.ParticleSystem3D=null;

    onLoad() {
        this.skeleton = this.node.children[0].getComponent(sp.Skeleton);
        this.scaleX_skeleton = Math.abs(this.skeleton.node.scaleX);
        this.enemyAnimation = this.node.children[0].getComponent(enemyAnimation);
        this.enemyAnimation.enemyController = this;
        this.rigibody = this.node.getComponent(cc.RigidBody);
        this.boxCollider = this.node.getComponent(cc.PhysicsBoxCollider);
        this.smokeParticle_Black=this.smokeFX.getComponent(cc.ParticleSystem3D);
        this.smokeParticle_Red=this.smokeFX.children[0].getComponent(cc.ParticleSystem3D);
    }
    onEnable(){
        this.node.y=-216;
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
        cc.tween(this.node)
        .to(0.2,{y:-165.4})
        .start();
    }
    update() {
        if (this.isMove == false) return;
        let distance = this.getDistanceX();
        if (Math.abs(distance) < this.stopDistance) {
            this.hit();
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
            this.hit();
        } else {
            this.changeDirection();
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
        this.enemyAnimation.changeState(enemyState.Idle, 1, true);
        this.scheduleOnce(() => {
            if(this.enemyAnimation.state!=enemyState.Idle) return;
            this.AI_start();
        }, this.AI_interval);
    }
    changeDirection() {
        if(GameManager.instance.player==null) return;
        this.skeleton.node.scaleX = GameManager.instance.player.x > this.node.x? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        this.isDie = true;
        this.node.active = false;
        this.hideHp();
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true)
    }
    moveToPlayer() {
        this.rigibody.linearVelocity=cc.v2(this.nowSpeed,0);
    }
    skillStart(){
        this.enemyAnimation.changeState(enemyState["Skill-Start"],1,false);
        this.scheduleOnce(this.skillMiddle,2.5);
    }
    skillMiddle(){
        let x=GameManager.instance.playerController.skeleton.node.scaleX>0?
        GameManager.instance.player.x+130:
        GameManager.instance.player.x-130;
        this.node.x=x;
        this.changeDirection();
        this.openCollider();
        this.enemyAnimation.changeState(enemyState["Skill-Middle"],1,false);
        this.scheduleOnce(this.skillEnd,1.7);
        this.showDamageCollider(damageCollider.skill);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state==enemyState["Skill-Middle"]){
                this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage*1.7);
                if(this.getDamageCollider().getComponent(enemyHitCollider).player){
                    Events.instance.screenShake(8,0,12);
                }
            }
        },0.2);
    }
    skillEnd(){
        let x=0;
        if(GameManager.instance.player.x<700){
            x=GameManager.instance.player.x+caijiTools.random_int(300,cc.winSize.width/1.5);
        }else if(GameManager.instance.player.x>1700){
            x=GameManager.instance.player.x-caijiTools.random_int(200,cc.winSize.width/1.5);
        }else{
            let random=caijiTools.random_int(1,10);
            x=random%2==0?
            GameManager.instance.player.x+caijiTools.random_int(-cc.winSize.width/1.5,-200):
            GameManager.instance.player.x+caijiTools.random_int(200,cc.winSize.width/1.5);
        }
        this.node.x=x;
        this.openCollider();
        this.changeDirection();
        this.enemyAnimation.changeState(enemyState["Skill-End"],1,false);
    }
    hit() {
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        if(this.nowAttackTimes<this.allowAttackTimes){
            this.nowAttackTimes++;
            this.showDamageCollider(damageCollider.attack);
            this.enemyAnimation.changeState(enemyState.Atk, 1, false);
            this.scheduleOnce(()=>{
                if(this.enemyAnimation.state==enemyState.Atk){
                    if(this.getDamageCollider().getComponent(enemyHitCollider).player){
                        Events.instance.screenShake(8,0,12);
                    }
                    this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
                }
            },0.5);
        }else{
            this.nowAttackTimes=0;
            this.skillStart();
        }
    }
    beHit(damage: number, dmgType: attackType) {
        // let isContinue = this.checkIsSwordRain(dmgType);//设置剑雨攻击间隔
        // if (isContinue == 0) return;
        this.highLight();
        this.showHp();
        this.changeState_beHit(dmgType);
        let x = this.node.scaleX < 0 ? this.node.x + this.damageLabelOffsetX : this.node.x - this.damageLabelOffsetX;
        let y = this.node.y + this.damageLabelOffsetY*1.2;
        Events.instance.showDamageLabel_enemy(this.node, damage, cc.v2(x, y));
        this.updateHp(damage);
        if (this.hp <= 0) {
            Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
        }
    }
    closeCollider(){
        this.boxCollider.enabled=false;
        this.boxCollider.apply();
        this.node.getComponent(cc.BoxCollider).enabled=false;
        this.hideHp();
        this.smokeParticle_Black.startColor.color.a=0;
        this.smokeParticle_Red.startColor.color.a=0;
        this.smokeParticle_Red.clear();
    }
    openCollider(){
        this.boxCollider.enabled=true;
        this.boxCollider.apply();
        this.node.getComponent(cc.BoxCollider).enabled=true;
        cc.tween(this.smokeParticle_Black.startColor.color)
        .to(0.2,{a:150})
        .start();
        cc.tween(this.smokeParticle_Red.startColor.color)
        .to(0.05,{a:150})
        .start();
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
                state = enemyState.knock_down;
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
