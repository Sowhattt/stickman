import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { attackType, enemyName, enemyState } from "./animationState";
import E39Laser from "./E39Laser";
import enemyAnimation from "./enemyAnimation";
import enemyBase from "./enemyBase";
import enemyHitCollider from "./enemyHitCollider";
import Events from "./Events";
import GameManager from "./GameManager";
import { bossName } from "./ui/bossHp";
import uiManager from "./ui/uiManager";

const { ccclass, property } = cc._decorator;
enum damageCollider {
    laser,
    forward,
    scratch
}
@ccclass
export default class E39controller extends enemyBase {

    @property({ type: cc.Float, tooltip: "伤害效果x轴偏移值" })
    damageLabelOffsetX: number = 0;
    @property({ type: cc.Float, tooltip: "伤害效果y轴偏移值" })
    damageLabelOffsetY: number = 0;
    @property(cc.String)
    dieEffectName: string = "";

    rushSpeed: number = 700;//冲击速度
    moveSpeed: number = 140;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.5;//ai间隔
    stopDistance: number = 230;//停止距离
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
    isWuDi: boolean = true;//无敌状态
    dmgCollider: damageCollider = null;
    isHighLight: boolean = false;
    highLight_A = {
        a: 0.5
    };
    nomalAttackMax: number = 5;//普通攻击连续最大次数
    normalAttackTimes: number = 0;//普通攻击次数（达一定次数后升空放小蜘蛛）
    lastAttackState: enemyState = null;
    spiderlingPrefab: cc.Prefab = null;

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
        uiManager.ins.showBossHp(bossName.enemy39);
        this.initData();
        this.hp = this.hpMax * this.hpTimes;
        //this.idle();
        this.scheduleOnce(() => {
            this.FX_landing();
        }, 2.4);
    }
    update() {
        this.highLightAction();
        if (this.isMove == false) return;
        let distance = this.getDistanceX();
        if (Math.abs(distance) < this.stopDistance) {
            this.attack();
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
        }
    }
    showDamageCollider(collider: damageCollider) {
        if (collider != damageCollider.laser) {
            this.skeleton.node.children[collider].getComponent(enemyHitCollider).enemyControl = this;
        }
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
        this.stopDistance = caijiTools.random_int(150, 400);
        if (this.isDie) return;
        if (GameManager.instance.playerController.isDie) {
            //玩家已死 停止移动
            this.changeMovState(false);
            this.scheduleOnce(() => {
                this.AI_start();
            }, 1);
            if ([enemyState.Idle, enemyState.Idle2, enemyState.Idle3].includes(this.enemyAnimation.state)) return;
            this.enemyAnimation.changeState(enemyState.Idle, 1, true, true);
            return;
        }
        let distance = Math.abs(this.getDistanceX());
        if (distance < this.stopDistance) {
            this.attack();
        } else {
            this.changeDirection();
            this.enemyAnimation.changeState(enemyState.Move, 1, true, true, true);
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
        this.setLinearDamping(0);
        this.setRigibodySpeed(0, 0);
        let random = caijiTools.random_int(1, 3);
        switch (random) {
            case 1:
                this.enemyAnimation.changeState(enemyState.Idle, 1, true, true);
                break;
            case 2:
                this.enemyAnimation.changeState(enemyState.Idle2, 1, true, true);
                break;
            case 3:
                this.enemyAnimation.changeState(enemyState.Idle3, 1, true, true);
                break;
        }
        audioManager.playAudio(audioName.E39Above2);
    }
    attack() {
        this.changeDirection();
        this.setRigibodySpeed(0, 0);
        this.changeMovState(false);
        this.setLinearDamping(0);
        if (this.normalAttackTimes == this.nomalAttackMax) {
            this.initAttackTimes();
            this.above1();
        } else {
            this.normalAttackTimes++;
            let distnace = this.getDistanceX();
            let attackState: Array<enemyState> = [
                enemyState.Jump_FWD,
                enemyState.Jump_Back,
                enemyState.Scratch
            ];
            if (this.lastAttackState != null) {
                attackState.splice(attackState.indexOf(this.lastAttackState), 1);
            }
            let random = caijiTools.random_int(0, attackState.length - 1);
            let state = attackState[random];
            if (distnace > 300) {
                //跃击
                state = enemyState.Jump_FWD;
            }
            switch (state) {
                case enemyState.Jump_FWD:
                    this.Jump_FWD();
                    break;
                case enemyState.Jump_Back:
                    this.Jump_Back();
                    break;
                case enemyState.Scratch:
                    this.Scratch();
                    break;
            }
            this.lastAttackState = state;
        }
    }
    initAttackTimes() {
        this.normalAttackTimes = 0;
        this.nomalAttackMax = caijiTools.random_int(4, 6);
    }
    //攻击结束
    attackComplete() {
        let random = caijiTools.random_int(1, 100);
        if (random < 30) {
            this.idle();
        } else {
            this.AI_start();
        }
    }
    bornComplete() {
        this.closeWuDi();
        this.AI_start();
    }
    //开始生成小蜘蛛
    above1Complete() {
        audioManager.playAudio(audioName.E39Above2);
        this.schedule(this.createSpiderling, 0.5, 6);
        this.scheduleOnce(() => {
            this.above2();
        }, 4);
    }
    async createSpiderling() {
        if (this.spiderlingPrefab == null) {
            this.spiderlingPrefab = await caijiTools.loadPrefab("prefabs/enemys/spiderling");
        }
        let spiderling = caijiTools.createNode(this.spiderlingPrefab, this.node.parent);
        let x = GameManager.instance.player.x + caijiTools.random_int(-cc.winSize.width * 0.6, cc.winSize.width * 0.6)
        spiderling.setPosition(x, -182);
        spiderling.setSiblingIndex(this.node.getSiblingIndex());
        spiderling.active = true;
    }
    //着落完成
    above2Complete() {
        this.closeWuDi();
        this.AI_start();
    }
    idleComplete() {
        if (GameManager.instance.playerController.isDie) return;
        this.AI_start();
    }
    changeDirection() {
        if (GameManager.instance.player == null) return;
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    die() {
        audioManager.playAudio(audioName.E39_death);
        this.isDie = true;
        this.setRigibodySpeed(0, 0);
        this.changeMovState(false);
        this.unscheduleAllCallbacks();
        this.enemyAnimation.changeState(enemyState.Die, 1, false, true);
        this.dieCount();
    }
    move() {
        this.enemyAnimation.changeState(enemyState.Move, 1, true, true);
    }
    moveToPlayer() {
        this.rigibody.linearVelocity = cc.v2(this.nowSpeed, 0);
    }
    openWuDi() {
        this.isWuDi = true;
    }
    closeWuDi() {
        this.isWuDi = false;
    }
    //升空
    above1() {
        audioManager.playAudio(audioName.E39Above1);
        this.openWuDi();
        this.enemyAnimation.changeState(enemyState.Above1, 1, false, true);
    }
    //降落
    above2() {
        this.node.x = GameManager.instance.player.x;
        this.enemyAnimation.changeState(enemyState.Above2, 1, false, true);
        this.scheduleOnce(() => {
            this.FX_landing();
        }, 2.4);
    }
    //后跳激光攻击
    Jump_Back() {
        audioManager.playAudio(audioName.E39Jump);
        this.enemyAnimation.changeState(enemyState.Jump_Back, 1, false);
        this.scheduleOnce(() => {
            let offsetX = this.skeleton.node.scaleX > 0 ? 150 : -150;
            cc.tween(this.node)
                .by(0.3, { x: offsetX })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this.enemyAnimation.state != enemyState.Jump_Back) return;
                        audioManager.playAudio(audioName.E39Laser);
                        this.showDamageCollider(damageCollider.laser);
                    }, 0.5);
                })
                .start();
        }, 0.5);
    }
    //前跃攻击
    Jump_FWD() {
        audioManager.playAudio(audioName.E39Jump);
        this.enemyAnimation.changeState(enemyState.Jump_FWD, 1, false);
        this.showDamageCollider(damageCollider.forward);
        this.scheduleOnce(() => {
            let offsetX = this.skeleton.node.scaleX > 0 ? -150 : 150;
            cc.tween(this.node)
                .by(0.3, { x: offsetX })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this.enemyAnimation.state != enemyState.Jump_FWD) return;
                        audioManager.playAudio(audioName.E39Attack);
                        this.hit(this.damage);
                    }, 0.25);
                })
                .start();
        }, 0.5);
    }
    //腿击
    Scratch() {
        audioManager.playAudio(audioName.E39Scratch);
        this.enemyAnimation.changeState(enemyState.Scratch, 1, false);
        this.showDamageCollider(damageCollider.scratch);
        this.scheduleOnce(() => {
            if (this.enemyAnimation.state != enemyState.Scratch) return;
            this.hit(this.damage);
        }, 0.6);
    }
    //虚弱
    Staggered() {
        this.enemyAnimation.changeState(enemyState.Staggered, 1, false);
    }
    //虚弱结束
    StaggeredReset() {
        this.enemyAnimation.changeState(enemyState.StaggeredReset, 1, false);
    }
    async FX_landing() {
        audioManager.playAudio(audioName.Spell_Earth_02);
        let prefab = await caijiTools.loadPrefab("prefabs/landingFX_enemy39");
        let fx = caijiTools.createNode(prefab, this.node.parent);
        fx.setSiblingIndex(this.node.getSiblingIndex() + 1);
        fx.setPosition(this.node.x, this.node.y);
        fx.active = true;
        this.scheduleOnce(() => {
            fx.destroy();
        }, 2);
        Events.instance.screenShake();
    }
    //脚步
    footStep(e, event) {
        //if(event.time>0)
        //audioManager.playAudio(audioName.E39Step,false,0.6);
    }
    beHit(damage: number, dmgType: attackType) {
        if (this.isDie || this.isWuDi) return;
        // let isContinue = this.checkIsSwordRain(dmgType);//设置剑雨攻击间隔
        // if (isContinue == 0) return;
        this.changeState_beHit(dmgType);
        let x = this.skeleton.node.scaleX > 0 ? this.node.x + this.damageLabelOffsetX : this.node.x - this.damageLabelOffsetX;
        let y = this.node.y + this.damageLabelOffsetY;
        this.highLight();
        Events.instance.showDamageLabel_enemy(this.node, damage, cc.v2(x, y));
        this.updateHp(damage);
        if (this.hp <= 0) {
            Events.instance.createEnemyDieEffect(this.node, this.dieEffectName, cc.v2(x, y));
        }
    }
    hit(damage: number) {
        if (this.dmgCollider != damageCollider.laser) {
            this.getDamageCollider().getComponent(enemyHitCollider).hit(this.node, damage);
        }
    }
    laserHit() {
        if (this.dmgCollider != damageCollider.laser) return;
        this.getDamageCollider().getComponent(E39Laser).laserCollider.getComponent(enemyHitCollider).hit(this.node, this.damage);
        this.hideDamageCollider();
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
