import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import GameManager from "./GameManager";
import ladyBugFx from "./ladyBugFx";

const { ccclass, property } = cc._decorator;
enum damageCollider{
    attack
}
@ccclass
export default class bigSquidController extends enemyBase {

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

    rushSpeed:number=2000;//冲击速度
    moveSpeed: number = 350;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.5;//ai间隔
    stopDistance:number=250;//停止距离
    stopDistance_y:number=200;//停止y轴移动距离（200-250）
    hp: number = 0;
    hpTimes:number=1;//血量倍数
    beHitForce_y: number = 0;//手里剑攻击作用力
    beHitForce_x: number = 0//普通攻击作用力
    beHitForce_y_shuriken: number = 0//普通攻击作用力
    beHitForce_x_attack3: number = 0;//被击飞作用力
    beHitForce_y_attack3: number = 0;//被击飞作用力
    scaleX_skeleton: number = 0;
    isDie: boolean = false;
    skeleton: sp.Skeleton = null;
    enemyAnimation: enemyAnimation = null;
    rigibody: cc.RigidBody = null;
    boxCollider: cc.PhysicsBoxCollider = null;
    isSwordRainCd: boolean = false;
    isSuperArmor: boolean = false;//是否霸体
    isMove: boolean = false;//是否处于移动状态
    dmgCollider:damageCollider=null;
    rushDirect:cc.Vec3=null;
    rushDistance:number=0;
    rushStartPos:cc.Vec3=null;

    onLoad() {
        this.skeleton = this.node.children[1].getComponent(sp.Skeleton);
        this.scaleX_skeleton = Math.abs(this.skeleton.node.scaleX);
        this.enemyAnimation = this.node.children[1].getComponent(enemyAnimation);
        this.enemyAnimation.enemyController = this;
        this.rigibody = this.node.getComponent(cc.RigidBody);
        this.boxCollider = this.node.getComponent(cc.PhysicsBoxCollider);
    }
    start() {
        this.init();
        //@ts-ignore
        //console.log(this.skeleton.skeletonData._skeletonCache.animations);
/*         this.skeleton.skeletonData._skeletonCache.slots[8].color=cc.color(0,0,0,0);
        this.skeleton.skeletonData._skeletonCache.slots[8].darkColor=cc.color(0,0,0,0); */
    }
    init() {
        this.initData();
        this.hp = this.hpMax*this.hpTimes;
        let x=GameManager.instance.player.x+caijiTools.random_int(-cc.winSize.width/1.3,cc.winSize.width/1.3);
        let y=cc.winSize.height/2+caijiTools.random_int(30,100);
        this.node.setPosition(x,y);
        this.AI_start();
    }
    update() {
        this.checkRushEnd();
        if (this.isMove == false) return;
        let distance = this.getDistance();
        if (Math.abs(distance) < this.stopDistance) {
            this.rigibody.linearVelocity=cc.v2(0,0);
            this.changeMovState(false);
            this.preAttack();
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
            if(this.enemyAnimation.state==enemyState.Die2){
                this.rigibody.enabledContactListener=false;
                this.die_end();
            }else{
                this.rushEnd();
            }
        }else if(other.group=="wall"){
            contact.disabled=true;
        }
    }
    checkRushEnd(){
        if(this.enemyAnimation.state==enemyState.Attack){
            this.rigibody.linearVelocity=cc.v2(this.rushDirect.x*this.rushSpeed,this.rushDirect.y*this.rushSpeed);
            let moveDistance=this.node.position.sub(this.rushStartPos).len();
            if(moveDistance>=this.rushDistance){
                this.rushEnd();
            }
        }
    }
    showDamageCollider(collider:damageCollider){
        this.skeleton.node.children[collider].getComponent(enemyHitCollider).enemyControl=this;
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
        this.stopDistance=caijiTools.random_int(250,400);
        if(GameManager.instance.playerController.isDie){
            //玩家已死 停止移动
            this.scheduleOnce(()=>{
                this.AI_start();
            },1);
            return;
        }
        let distance = Math.abs(this.getDistance());
        if (distance < this.stopDistance+100) {
            let x=this.skeleton.node.scaleX<0?
            GameManager.instance.player.x-caijiTools.random_int(200,400):
            GameManager.instance.player.x+caijiTools.random_int(200,400);
            let y=GameManager.instance.player.y+caijiTools.random_int(150,300);
            let distance=cc.v3(x,y).sub(this.node.position).len();
            cc.tween(this.node)
            .to(distance/300,{position:cc.v3(x,y)})
            .call(()=>{
                let distance = Math.abs(this.getDistance());
                if (distance > 200 && distance<=400){
                    this.preAttack();
                }else{
                    this.idle();
                }
            })
            .start();
        } else {
            this.changeStopDistanceY();
            this.changeMovState(true);
        }
    }
    AI_stop() {
        this.idle();
    }
    changeStopDistanceY(){
        this.stopDistance_y=caijiTools.random_int(200,350);
    }
    changeMovState(isMove: boolean) {
        this.isMove = isMove;
    }
    idle() {
        this.skeleton.node.angle=0;
        this.changeMovState(false);
        this.setLinearDamping(0);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.Idle, 1, true, true);
        this.scheduleOnce(() => {
            this.AI_start();
        }, this.AI_interval);
    }
    changeDirection() {
        this.skeleton.node.scaleX = GameManager.instance.player.x > this.node.x ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        if(this.isDie) return;
        audioManager.playAudio(audioName.E25Die);
        this.node.children[0].active=false;
        this.unscheduleAllCallbacks();
        cc.Tween.stopAllByTarget(this.node);
        this.closeHighLight();
        this.isDie = true;
        this.hideHp();
        this.enemyAnimation.changeState(enemyState.Die1,1,false);
        this.dieCount();
    }
    die_middle(){
        this.rigibody.gravityScale=5;
        this.rigibody.linearVelocity=cc.v2(0,-1000);
        this.enemyAnimation.changeState(enemyState.Die2,1,false);
    }
    die_end(){
        this.enemyAnimation.changeState(enemyState.Die3,1,false,true);
    }
    Destory(){
        this.node.destroy();
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true);
    }
    moveToPlayer() {
        this.changeDirection();
        let targetPosition=cc.v3(GameManager.instance.player.x,GameManager.instance.player.y+55);
        let direct=targetPosition.sub(this.node.position).normalizeSelf();
        this.rigibody.linearVelocity=cc.v2(this.moveSpeed*direct.x,this.moveSpeed*direct.y);
    }
    preAttack(){
        audioManager.playAudio(audioName.E25Attack);
        let targetPosition=cc.v3(GameManager.instance.player.x,GameManager.instance.player.y+55);
        this.changeDirection();
        this.rushDirect=targetPosition.sub(this.node.position).normalizeSelf();;
        this.enemyAnimation.changeState(enemyState.Pre_Attack, 1, false, true);
    }
    rush(){
        this.rushStartPos=this.node.position;
        this.rushDistance=this.getDistance()+70;
        let angle=caijiTools.getAngleDependY(this.rushDirect.x,this.rushDirect.y);
        if(this.skeleton.node.scaleX>0){
            this.skeleton.node.angle=-angle-90;
        }else{
            this.skeleton.node.angle=-angle+90;
        }
        this.enemyAnimation.changeState(enemyState.Attack, 1, false, true);
        this.node.children[0].active=true;
        this.showDamageCollider(damageCollider.attack);
        this.scheduleOnce(()=>{
        this.node.children[0].getComponent(cc.MotionStreak).color=cc.color(255,255,255,255);
        },0.05);
    }
    rushEnd(){
        this.hideDamageCollider();
        this.node.children[0].active=false;
        this.node.children[0].getComponent(cc.MotionStreak).color=cc.color(255,255,255,0);
        this.idle();
    }
    hit() {
        this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node,this.damage);
        this.hideDamageCollider();
    }
    fire(trackEntry,event){
        if(event.data.name=="Fire"){
            this.createFX();
        }
    }
    async createFX(){
        let x=this.skeleton.node.scaleX>0?this.node.x-40:this.node.x+40;
        let y=this.node.y-40;
        let prefab=await caijiTools.loadPrefab("prefabs/ladyBugFX");
        let effect=caijiTools.createNode(prefab,this.node.parent);
        effect.setSiblingIndex(this.node.getSiblingIndex()+1);
        effect.setPosition(x,y);
        effect.getComponent(ladyBugFx).isRightMove=this.skeleton.node.scaleX>0?false:true;
        effect.getComponent(ladyBugFx).damage=this.damage;
        effect.active=true;
    }
    beHit(damage: number, dmgType: attackType) {
        if(this.isDie) return;
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
        if (this.hp <= 0) {
            Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
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
    getDistance(){
        return this.node.position.sub(GameManager.instance.player.position).len();
    }
    getDistanceX() {
        return this.node.x - GameManager.instance.player.x;
    }
    getDistanceY(){
        return Math.abs(this.node.y-GameManager.instance.player.y);
    }
}
