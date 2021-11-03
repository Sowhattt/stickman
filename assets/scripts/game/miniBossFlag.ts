import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyState } from "./animationState";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import FX_flagThunder from "./FX_flagThunder";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;
enum damageCollider {
    attack
}
@ccclass
export default class miniBoss extends enemyBase {

    @property(cc.Prefab)
    thunderPre:cc.Prefab=null;
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
    AI_interval: number = 1;//ai间隔
    stopDistance: number = 130;//停止距离
    hp: number = 0;
    hpTimes: number = 1;//血量倍数
    beHitForce_y: number = 25000;//手里剑攻击作用力
    beHitForce_x: number = 25000//普通攻击作用力
    beHitForce_y_shuriken: number = 50000//普通攻击作用力
    beHitForce_x_attack3: number = 350000;//被击飞作用力
    beHitForce_y_attack3: number = 0;//被击飞作用力
    scaleX_skeleton: number = 0;
    isDie: boolean = false;
    isWuDu: boolean = true;
    skeleton: sp.Skeleton = null;
    enemyAnimation: enemyAnimation = null;
    rigibody: cc.RigidBody = null;
    boxCollider: cc.PhysicsBoxCollider = null;
    isSwordRainCd: boolean = false;
    isMove: boolean = false;//是否处于移动状态
    dmgCollider: damageCollider = null;
    isWarning: boolean = false;
    warn_a = {
        a: 0
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
        //console.log(this.skeleton.skeletonData._skeletonCache.animations)
    }
    init() {
        this.initData();
        this.hp = this.hpMax * this.hpTimes;
        audioManager.playAudio(audioName.E27LightningTotemFall);
    }
    appearFinished() {
        this.isWuDu = false;
        this.idle();
    }
    update() {
        this.warningAction();
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
        if (other.group == "ground") {
        }
    }
    showDamageCollider(collider: damageCollider) {
        this.skeleton.node.children[collider].active = true;
        this.dmgCollider = collider;
    }
    getDamageCollider() {
        return this.skeleton.node.children[this.dmgCollider];
    }
    hideDamageCollider() {
        if (this.dmgCollider == null) return;
        this.skeleton.node.children[this.dmgCollider].active = false;
        this.dmgCollider = null;
    }
    AI_start() {
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
            let moveState = ["move", "move2", "run"];
            let randomState = moveState[caijiTools.random_int(0, moveState.length - 1)];
            this.enemyAnimation.changeState(enemyState[randomState], 1, true);
            switch (this.enemyAnimation.state) {
                case enemyState.move:
                    this.nowSpeed = this.moveSpeed;
                    break;
                case enemyState.move2:
                    this.nowSpeed = this.moveSpeed;
                    break
                case enemyState.run:
                    this.nowSpeed = this.moveSpeed * 1.8;
                    break;
            }
            this.changeMovState(moveState.includes(this.skeleton.animation));
            this.nowSpeed = this.skeleton.node.scaleX > 0 ? -this.nowSpeed : this.nowSpeed;
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
        //this.changeDirection();
        this.setLinearDamping(0);
        this.setRigibodySpeed(0, 0);
        this.enemyAnimation.changeState(enemyState.idle, 1, true);
        this.scheduleOnce(() => {
            if (this.enemyAnimation.state != enemyState.idle) return;
            this.warning();
        }, 2);
    }
    warning() {
        this.isWarning=true;
        this.skeleton.setAttachment("images/totem/eff_light", "images/totem/eff_light");
        this.skeleton.setAttachment("images/totem/eff_light2", "images/totem/eff_light");
        cc.tween(this.warn_a)
        .repeatForever(
            cc.tween()
            .to(0.1,{a:1},{"easing":"sineOut"})
            .to(0.1,{a:0.1},{"easing":"sineIn"})
        )
        .start();
        this.scheduleOnce(this.bomb,2);
    }
    warningAction() {
        if (this.isWarning == false) return;
        //@ts-ignore
        this.skeleton._skeleton.slots[4].color["a"] = this.warn_a.a;
        //@ts-ignore
        this.skeleton._skeleton.slots[5].color["a"] = this.warn_a.a;
    }
    changeDirection() {
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        if(this.isDie) return;
        this.isDie = true;
        this.isWarning=false;
        this.hideHp();
        //@ts-ignore
        this.skeleton._skeleton.slots[4].color["a"] = 0;
        //@ts-ignore
        this.skeleton._skeleton.slots[5].color["a"] = 0;
        this.enemyAnimation.changeState(enemyState.die, 1, false, true)
    }
    //召唤闪电
    bomb() {
        if(this.isDie) return;
        this.isDie = true;
        this.isWarning=false;
        this.hideHp();
        //@ts-ignore
        this.skeleton._skeleton.slots[4].color["a"] = 0;
        //@ts-ignore
        this.skeleton._skeleton.slots[5].color["a"] = 0;
        this.enemyAnimation.changeState(enemyState.die, 1, false, true);
        this.FX_thunder();
    }
    //闪电
    FX_thunder(){
        audioManager.playAudio(audioName.ThunderTotemStruck);
        let thunder=cc.instantiate(this.thunderPre);
        thunder.setParent(this.node.parent);
        thunder.setPosition(this.node.position);
        thunder.setSiblingIndex(GameManager.instance.player.getSiblingIndex()+1);
        thunder.getComponent(FX_flagThunder).damage=this.damage;
        thunder.active=true;
    }
    dieEnd(){
        this.node.destroy();
    }
    getUp() {
        this.enemyAnimation.changeState(enemyState.get_up, 1, false, true)
    }
    moveToPlayer() {
        this.rigibody.linearVelocity = cc.v2(this.nowSpeed, 0);
    }
    hit() {
        if (enemyState[this.enemyAnimation.state].includes("get_hurt")) return;
        this.changeDirection();
        this.changeMovState(false);
        this.setRigibodySpeed(0, 0);
        this.showDamageCollider(damageCollider.attack);
        this.enemyAnimation.changeState(enemyState.attack, 1, false);
        this.scheduleOnce(() => {
            if (this.enemyAnimation.state == enemyState.attack) {
                this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node, this.damage);
            }
        }, 0.5);
    }
    beHit(damage: number, dmgType: attackType) {
        if (this.isDie || this.isWuDu) return;
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
        this.scheduleOnce(this.hideHp, 2);
    }
    hideHp() {
        this.hpNode.active = false;
    }
    highLight() {
        this.unschedule(this.closeHighLight);
        this.skeleton.getMaterial(0).setProperty("beHit", 1);
        this.skeleton.getMaterial(0).setProperty("highLightColor", [1.0, 1.0, 1.0, 0.5]);
        this.scheduleOnce(this.closeHighLight, 0.15);
    }
    closeHighLight() {
        this.skeleton.getMaterial(0).setProperty("beHit", 0);
    }
    getDistanceX() {
        return this.node.x - GameManager.instance.player.x;
    }
}
