import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import GameManager from "./GameManager";
import { bossName } from "./ui/bossHp";
import uiManager from "./ui/uiManager";

const { ccclass, property } = cc._decorator;
enum damageCollider {
    attack,
    skill1,
    skill2
}
@ccclass
export default class E10controller extends enemyBase {

    @property({ type: cc.Float, tooltip: "伤害效果x轴偏移值" })
    damageLabelOffsetX: number = 0;
    @property({ type: cc.Float, tooltip: "伤害效果y轴偏移值" })
    damageLabelOffsetY: number = 0;
    @property(cc.String)
    dieEffectName: string = "";

    rushSpeed: number = 700;//冲击速度
    moveSpeed: number = 120;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.5;//ai间隔
    stopDistance: number = 300;//停止距离
    hp: number = 0;
    hpTimes: number = 1;//血量倍数
    beHitForce_y: number = 25000;//手里剑攻击作用力
    beHitForce_x: number = 25000//普通攻击作用力
    beHitForce_y_shuriken: number = 50000//普通攻击作用力
    beHitForce_x_attack3: number = 350000;//被击飞作用力
    beHitForce_y_attack3: number = 0;//被击飞作用力
    scaleX_skeleton: number = 0;
    allowMoveTime: number = 2;//允许move状态最长时间
    allowAttackTime: number = 2;//允许连续attack次数
    attackTimes: number = 0;//attack连续次数
    skill1_x: number = 0;//泰山压顶落地坐标（升空时玩家位置）
    isStartRush: boolean = false;//开始冲撞
    isDie: boolean = false;
    skeleton: sp.Skeleton = null;
    enemyAnimation: enemyAnimation = null;
    rigibody: cc.RigidBody = null;
    boxCollider: cc.PhysicsBoxCollider = null;
    isSwordRainCd: boolean = false;
    isMove: boolean = false;//是否处于移动状态
    isWuDi: boolean = false;//无敌状态
    dmgCollider: damageCollider = null;
    isHighLight: boolean = false;
    highLight_A = {
        a: 0.5
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
        uiManager.ins.showBossHp(bossName.enemy10);
        this.initData();
        this.hp = this.hpMax * this.hpTimes;
        this.idle();
    }
    update() {
        this.highLightAction();
        this.skill2Move();
        if (this.isMove == false) return;
        let distance = this.getDistanceX();
        if (Math.abs(distance) < this.stopDistance) {
            this.hit();
        } else {
            if (this.enemyAnimation.state == enemyState.attack) return;
            this.moveToPlayer();
        }
    }
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let other = otherCollider.node;
        // let worldManifold = contact.getWorldManifold();
        // let normal = worldManifold.normal;
        if (other.group == "wall") {
            this.skill2End();
        }
    }
    showDamageCollider(collider: damageCollider) {
        this.skeleton.node.children[collider].getComponent(enemyHitCollider).enemyControl = this;
        this.skeleton.node.children[collider].active = true;
        this.dmgCollider = collider;
    }
    getDamageCollider() {
        return this.skeleton.node.children[this.dmgCollider];
    }
    hideDamageCollider(isCompelClose: boolean = false) {
        if (this.dmgCollider == null) return;
        if (this.dmgCollider == damageCollider.skill1 && isCompelClose == false) return;
        this.skeleton.node.children[this.dmgCollider].active = false;
        this.dmgCollider = null;
    }
    AI_start() {
        this.allowAttackTime = caijiTools.random_int(2, 3);
        this.allowMoveTime = caijiTools.random_int(200, 500) / 100;
        if (this.isDie) return;
        if (GameManager.instance.playerController.isDie) {
            //玩家已死 停止移动
            this.changeMovState(false);
            this.scheduleOnce(() => {
                this.AI_start();
            }, 1);
            return;
        }
        let distance = Math.abs(this.getDistanceX());
        if (distance < this.stopDistance) {
            this.hit();
        } else {
            this.changeDirection();
            this.enemyAnimation.changeState(enemyState.move, 1, true);
            this.changeMovState(true);
            this.nowSpeed = this.skeleton.node.scaleX > 0 ? -this.moveSpeed : this.moveSpeed;
            this.scheduleOnce(() => {
                if (this.enemyAnimation.state != enemyState.move) return;
                this.skill2();
            }, this.allowMoveTime);
        }
    }
    AI_stop() {
        this.idle();
    }
    changeMovState(isMove: boolean) {
        this.isMove = isMove;
    }
    idle(nextState: enemyState = enemyState.idle) {
        this.changeMovState(false);
        this.setLinearDamping(0);
        this.setRigibodySpeed(0, 0);
        this.enemyAnimation.changeState(enemyState.idle, 1, true, true);
        this.scheduleOnce(() => {
            if (this.enemyAnimation.state != enemyState.idle) return;
            if (nextState == enemyState.idle) {
                this.AI_start();
            } else {
                this.skill1();
            }
        }, this.AI_interval);
    }
    changeDirection() {
        if (GameManager.instance.player == null) return;
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        this.isDie = true;
        this.endRush();
        this.setRigibodySpeed(0, 0);
        this.changeMovState(false);
        this.unscheduleAllCallbacks();
        this.enemyAnimation.changeState(enemyState.die, 1, false, true);
        this.dieCount();
        audioManager.playAudio(audioName.E10_death);
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true)
    }
    moveToPlayer() {
        this.rigibody.linearVelocity = cc.v2(this.nowSpeed, 0);
    }
    hitComplete() {
        if (this.attackTimes < this.allowAttackTime) {
            if (this.getDistanceX() <= this.stopDistance) {
                this.hit();
            } else {
                this.changeDirection();
                this.enemyAnimation.changeState(enemyState.move, 1, true);
                this.changeMovState(true);
                this.nowSpeed = this.skeleton.node.scaleX > 0 ? -this.moveSpeed : this.moveSpeed;
                this.scheduleOnce(() => {
                    if (this.enemyAnimation.state != enemyState.move) return;
                    this.skill2();
                }, this.allowMoveTime);
            }
        } else {
            this.skill2();
        }
    }
    hit() {
        this.attackTimes++;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0, 0);
        this.showDamageCollider(damageCollider.attack);
        this.enemyAnimation.changeState(enemyState.attack, 1, false);
        this.scheduleOnce(() => {
            if (this.enemyAnimation.state == enemyState.attack) {
                this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node, this.damage);
            }
        }, 1.1);
        this.scheduleOnce(()=>{
            audioManager.playAudio(audioName.E10_attack);
        },0.6);
    }
    //冲撞攻击-skill
    hit_rush() {
        if (this.dmgCollider == damageCollider.skill1) {
            this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node, this.damage, true);
        }
    }
    //泰山压顶开始
    skill1() {
        this.skill1_x = GameManager.instance.player.x;
        this.skill1_x = this.skeleton.node.scaleX > 0 ? this.skill1_x + 200 : this.skill1_x - 200;
        this.isWuDi = true;
        this.enemyAnimation.changeState(enemyState.skill1, 1, false, true);
        this.showDamageCollider(damageCollider.skill2);
        audioManager.playAudio(audioName.E10_Jump);
    }
    frameEvent_skill1(e, event) {
        if (event.data.name == "StopMove") {
            //泰山压顶落地
            audioManager.playAudio(audioName.Spell_Earth_02);
            this.isWuDi = false;
            Events.instance.screenShake();
            this.FX_skill1();
            this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node, Math.floor(this.damage * 1.2), true);
        } else if (event.data.name == "Move") {
            //升空移动位置
            this.scheduleOnce(() => {
                this.node.x = this.skill1_x;
                this.skeleton.node.scaleX = this.node.x < GameManager.instance.player.x ? -this.scaleX_skeleton : this.scaleX_skeleton;
            }, 0.05);
        }
    }
    async FX_skill1() {
        let prefab = await caijiTools.loadPrefab("prefabs/FX_E10");
        let fx = caijiTools.createNode(prefab, this.node.parent);
        fx.setSiblingIndex(GameManager.instance.player.getSiblingIndex() + 1);
        fx.setPosition(this.node.x, this.node.y - 20);
        fx.active = true;
    }
    //野蛮冲撞开始
    skill2() {
        audioManager.playAudio(audioName.E10Roar);
        this.attackTimes = 0;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0, 0);
        this.nowSpeed = this.skeleton.node.scaleX > 0 ? -this.rushSpeed : this.rushSpeed;
        this.enemyAnimation.changeState(enemyState.skill2_start, 1, false, true);
        this.scheduleOnce(() => {
            if (this.enemyAnimation.state != enemyState.skill2_start) return;
            this.startRush();
        }, 1.1);
    }
    startRush() {
        this.isStartRush = true;
        this.showDamageCollider(damageCollider.skill1);
    }
    endRush() {
        this.isStartRush = false;
    }
    skill2Middle() {
        this.setRigibodySpeed(this.nowSpeed, 0);
        this.enemyAnimation.changeState(enemyState.skill2_middle, 1, true, true);
    }
    skill2End() {
        this.endRush();
        this.setRigibodySpeed(0, 0);
        this.hideDamageCollider(true);
        this.scheduleOnce(() => {
            if (this.isDie) return;
            this.enemyAnimation.changeState(enemyState.skill2_end, 1, false, true);
        }, 1);
    }
    skill2EndComplete() {
        this.idle(enemyState.skill1);
    }
    skill2Move() {
        if (this.isStartRush == false) return;
        this.rigibody.linearVelocity = cc.v2(this.nowSpeed, 0);
    }
    //脚步
    footStep() {
        audioManager.playAudio(audioName.E10Step);
    }
    beHit(damage: number, dmgType: attackType) {
        if (this.isDie || this.isWuDi) return;
        // let isContinue = this.checkIsSwordRain(dmgType);//设置剑雨攻击间隔
        // if (isContinue == 0) return;
        this.changeState_beHit(dmgType);
        let x = this.node.scaleX < 0 ? this.node.x + this.damageLabelOffsetX : this.node.x - this.damageLabelOffsetX;
        let y = this.node.y + this.damageLabelOffsetY;
        this.highLight();
        Events.instance.showDamageLabel_enemy(this.node, damage, cc.v2(x, y));
        this.updateHp(damage);
        if (this.hp <= 0) {
            Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
        }
    }
    updateHp(damage: number) {
        this.hp -= damage;
        uiManager.ins.bossHp.addHp(-damage);
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }
    setRigibodySpeed(x: number, y: number = 0) {
        this.rigibody.linearVelocity = cc.v2(x, y);
    }
    changeState_beHit(dmgType: attackType) {
        if (this.isSuperArmor) return;
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
    highLightAction() {
        if (this.isHighLight) {
            this.skeleton.getMaterial(0).setProperty("highLightColor", [1.0, 1.0, 1.0, this.highLight_A.a]);
        }
    }
    highLight() {
        if (this.isHighLight) return;
        this.isHighLight = true;
        this.skeleton.getMaterial(0).setProperty("beHit", 1);
        this.skeleton.getMaterial(0).setProperty("highLightColor", [1.0, 1.0, 1.0, 0.5]);
        cc.tween(this.highLight_A)
            .to(0.1, { a: 0 })
            .call(() => {
                this.closeHighLight();
            })
            .start();
    }
    closeHighLight() {
        this.isHighLight = false;
        this.highLight_A.a = 0.5;
        this.skeleton.getMaterial(0).setProperty("beHit", 0);
    }
    getDistanceX() {
        return Math.abs(this.node.x - GameManager.instance.player.x);
    }
}
