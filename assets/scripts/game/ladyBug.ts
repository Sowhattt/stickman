import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import Events from "./Events";
import GameManager from "./GameManager";
import ladyBugFx from "./ladyBugFx";

const { ccclass, property } = cc._decorator;
enum damageCollider{
    attack
}
@ccclass
export default class ladyBug extends enemyBase {

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

    moveSpeed: number = 300;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 1;//ai间隔
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
        let x=GameManager.instance.player.x+caijiTools.random_int(-cc.winSize.width/2,cc.winSize.width/2);
        let y=cc.winSize.height/2+caijiTools.random_int(30,100);
        this.node.setPosition(x,y);
        this.AI_start();
    }
    update() {
        if (this.isMove == false) return;
        let distance = this.getDistance();
        if (Math.abs(distance) < this.stopDistance) {
            this.rigibody.linearVelocity=cc.v2(0,0);
            this.changeMovState(false);
            if(Math.abs(this.getDistanceX())<50){
                let moveDistance=this.skeleton.node.scaleX>0?-100:100;
                cc.tween(this.node)
                .by(0.5,{x:moveDistance})
                .call(()=>{
                    this.hit();
                })
                .start();
            }else{
                this.hit();
            }
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
            this.rigibody.enabledContactListener=false;
            this.die_end();
        }else if(other.group=="wall"){
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
        if(GameManager.instance.playerController.isDie){
            //玩家已死 停止移动
            this.scheduleOnce(()=>{
                this.AI_start();
            },1);
            return;
        }
        let distance = Math.abs(this.getDistance());
        if (distance < this.stopDistance+50) {
            if(Math.abs(this.getDistanceX())<50){
                let moveDistance=this.skeleton.node.scaleX>0?-150:150;
                cc.tween(this.node)
                .by(0.5,{x:moveDistance})
                .call(()=>{
                    this.hit();
                })
                .start();
            }else{
                let x=this.skeleton.node.scaleX<0?
                GameManager.instance.player.x-caijiTools.random_int(150,400):
                GameManager.instance.player.x+caijiTools.random_int(100,300);
                let y=GameManager.instance.player.y+caijiTools.random_int(150,400);
                let distance=cc.v3(x,y).sub(this.node.position).len();
                cc.tween(this.node)
                .to(distance/300,{position:cc.v3(x,y)})
                .call(()=>{
                    this.hit();
                })
                .start();
            }
        } else {
            this.changeStopDistanceY();
            this.changeMovState(true);
            this.changeDirection();
        }
    }
    AI_stop() {
        this.idle();
    }
    changeStopDistanceY(){
        this.stopDistance_y=caijiTools.random_int(200,250);
    }
    changeMovState(isMove: boolean) {
        this.isMove = isMove;
    }
    idle() {
        this.changeMovState(false);
        this.changeDirection();
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
        this.unscheduleAllCallbacks();
        cc.Tween.stopAllByTarget(this.node);
        this.closeHighLight();
        this.isDie = true;
        this.hideHp();
        this.enemyAnimation.changeState(enemyState["Die-start"],1,false);
        this.dieCount();
    }
    die_middle(){
        this.rigibody.gravityScale=5;
        this.rigibody.linearVelocity=cc.v2(0,-1300);
        //this.enemyAnimation.changeState(enemyState["Die-middle"],1,false);
    }
    die_end(){
        this.enemyAnimation.changeState(enemyState.Die_end,1,false);
    }
    Destory(){
        this.node.destroy();
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true)
    }
    moveToPlayer() {
        this.changeDirection();
        let direct=GameManager.instance.player.position.sub(this.node.position).normalizeSelf();
        direct.y=this.getDistanceY()<=this.stopDistance_y?0:direct.y;
        this.rigibody.linearVelocity=cc.v2(this.moveSpeed*direct.x,this.moveSpeed*direct.y);
    }
    hit() {
        if(enemyState[this.enemyAnimation.state].includes("get_hurt")) return;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0,0);
        this.enemyAnimation.changeState(enemyState.Atk, 1, false);
    }
    fire(trackEntry,event){
        if(event.data.name=="Fire"){
            this.createFX();
        }
    }
    async createFX(){
        audioManager.playAudio(audioName.E24_Shoot);
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
