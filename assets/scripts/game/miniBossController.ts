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
import thunder_chase from "./thunder_chase";
import thunder_jolt from "./thunder_jolt";
import { bossName } from "./ui/bossHp";
import uiManager from "./ui/uiManager";

const { ccclass, property } = cc._decorator;
enum damageCollider {
    laser,
    forward,
    scratch
}
@ccclass
export default class miniBossController extends enemyBase {

    @property(cc.Prefab)
    thunder_jolt_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    thunder_one_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    thunder_many_prefab1: cc.Prefab = null;
    @property(cc.Prefab)
    thunder_many_prefab2: cc.Prefab = null;
    @property(cc.Prefab)
    flag_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    tpFx_start: cc.Prefab = null;

    @property({ type: cc.Float, tooltip: "伤害效果x轴偏移值" })
    damageLabelOffsetX: number = 0;
    @property({ type: cc.Float, tooltip: "伤害效果y轴偏移值" })
    damageLabelOffsetY: number = 0;
    @property(cc.String)
    dieEffectName: string = "";

    rushSpeed: number = 700;//冲击速度
    moveSpeed: number = 140;//移动速度
    nowSpeed: number = 0;//当前速度
    AI_interval: number = 0.7;//ai间隔
    stopDistance: number = 400;//停止距离
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
    attackType:enemyState[]=[];

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
        uiManager.ins.showBossHp(bossName.miniBoss);
        this.initData();
        this.hp = this.hpMax * this.hpTimes;
        audioManager.playAudio(audioName.ThunderTotemStruck);
    }
    appearFinished() {
        this.isWuDi = false;
        this.idle();
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
            contact.disabled=true;
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
        if (this.isDie) return;
        if (GameManager.instance.playerController.isDie) {
            //玩家已死 停止移动
            this.changeMovState(false);
            this.scheduleOnce(() => {
                this.AI_start();
            }, 1);
            if ([enemyState.idle].includes(this.enemyAnimation.state)) return;
            this.enemyAnimation.changeState(enemyState.idle, 1, true, true);
            return;
        }
        let distance = Math.abs(this.getDistanceX());
        if (distance < this.stopDistance) {
            this.attack();
        } else {
            this.changeDirection();
            this.enemyAnimation.changeState(enemyState.move, 1, true, true, true);
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
        this.enemyAnimation.changeState(enemyState.idle, 1, true, true);
        this.scheduleOnce(()=>{
            if(this.enemyAnimation.state!=enemyState.idle) return;
            this.AI_start();
        },this.AI_interval);
    }
    attack() {
        this.changeDirection();
        this.setRigibodySpeed(0, 0);
        this.changeMovState(false);
        this.setLinearDamping(0);
        this.normalAttackTimes++;
        if(this.getDistanceX()<150){
            this.blinkStart();
            return;
        }
        if(this.attackType.length==0){
            this.attackType=[
                enemyState.call_of_lighting,
                enemyState.lighting_chase_start,
                enemyState.storm_burst,
                enemyState.thunder_jolt
            ];
        }
        let random = caijiTools.random_int(0, this.attackType.length - 1);
        let state = this.attackType[random];
        if(state==this.lastAttackState){
            if(random==0){
                state = this.attackType[random+1];
            }else if(random==this.attackType.length-1){
                state = this.attackType[random-1];
            }else{
                state = this.attackType[random-1];
            }
        }
        this[enemyState[state]]();
        this.attackType.splice(this.attackType.indexOf(state), 1);
        // switch (state) {
        //     case enemyState.call_of_lighting:
        //         this.call_of_lighting();
        //         break;
        //     case enemyState.lighting_chase_start:
        //         this.lighting_chase_start();
        //         break;
        //     case enemyState.storm_burst:
        //         this.storm_burst();
        //         break;
        //     case enemyState.thunder_jolt:
        //         this.thunder_jolt();
        //         break;
        // }
        this.lastAttackState = state;
    }
    //召唤旗帜
    call_of_lighting() {
        audioManager.playAudio(audioName.E27TotemCast);
        this.enemyAnimation.changeState(enemyState.call_of_lighting, 1, false);
        this.scheduleOnce(() => {
            this.FX_flag();
        }, 1.3);
    }
    //持续召唤雷球（持续多段伤害）
    lighting_chase_start() {
        GameManager.instance.playerController.thunder_chase_cd=false;
        this.enemyAnimation.changeState(enemyState.lighting_chase_start, 1, false);
    }
    lighting_chase_middle() {
        audioManager.playAudio(audioName.E27Lightning);
        this.enemyAnimation.changeState(enemyState.lighting_chase_middle, 1, true);
        this.schedule(() => {
            this.FX_thunerBall_pos();
        }, 0.55, 8);
        this.scheduleOnce(() => {
            this.lighting_chase_end();
        }, 5);
    }
    lighting_chase_end() {
        this.enemyAnimation.changeState(enemyState.lighting_chase_end, 1, true);
    }
    //召唤溜溜球
    thunder_jolt() {
        audioManager.playAudio(audioName.E27JoltCast);
        this.enemyAnimation.changeState(enemyState.thunder_jolt, 1, false);
        this.scheduleOnce(() => {
            this.FX_thunder_jolt();
        }, 1);
    }
    //雷球风暴（扩散单段伤害）
    storm_burst() {
        this.enemyAnimation.changeState(enemyState.storm_burst, 1, false);
        this.FX_thunder_stormBurst1();
    }
    //传送动作开始
    blinkStart() {
        this.setRigibodySpeed(0);
        this.changeMovState(false);
        this.enemyAnimation.changeState(enemyState.blink_start, 1, false, true);
        this.scheduleOnce(()=>{
            audioManager.playAudio(audioName.BlinkStart);
        },0.2);
    }
    //传送开始动画完成
    binkStartCompelete() {
        this.createTPFX();
        this.teleportEnd();
    }
    //传送至指定地点
    teleportEnd() {
        audioManager.playAudio(audioName.BlinkEnd);
        let x = 0;
        if (GameManager.instance.player.x < 350) {
            x = GameManager.instance.player.x + caijiTools.random_int(400, cc.winSize.width / 1.6);
        } else if (GameManager.instance.player.x > 1150) {
            x = GameManager.instance.player.x - caijiTools.random_int(400, cc.winSize.width / 1.5);
        } else {
            let random = caijiTools.random_int(1, 10);
            x = random % 2 == 0 ?
                GameManager.instance.player.x + caijiTools.random_int(-cc.winSize.width / 1.6, -400) :
                GameManager.instance.player.x + caijiTools.random_int(400, cc.winSize.width / 1.5);
        }
        this.node.x = x;
        this.createTPFX();
        this.enemyAnimation.changeState(enemyState.blink_end, 1, false, true);
    }
    //TPFX
    createTPFX() {
        let fx = cc.instantiate(this.tpFx_start);
        fx.setParent(this.node.parent);
        fx.setSiblingIndex(this.node.getSiblingIndex() + 1);
        fx.setPosition(this.node.x, this.node.y + this.damageLabelOffsetY);
        fx.active = true;
    }
    //生成旗帜
    FX_flag() {
        let flag = cc.instantiate(this.flag_prefab);
        flag.setParent(this.node.parent);
        flag.setSiblingIndex(this.node.getSiblingIndex());
        flag.setPosition(GameManager.instance.player.x, -162);
        flag.active = true;
    }
    //溜溜球
    FX_thunder_jolt() {
        let jolt = cc.instantiate(this.thunder_jolt_prefab);
        jolt.setParent(this.node.parent);
        jolt.setSiblingIndex(GameManager.instance.player.getSiblingIndex() + 1);
        jolt.getComponent(thunder_jolt).damage = this.damage;
        let x = this.skeleton.node.scaleX > 0 ? this.node.x - 140 : this.node.x + 140;
        let y = this.node.y + 130;
        jolt.setPosition(x, y);
        jolt.active = true;
        let forceX = this.skeleton.node.scaleX > 0 ? -50000 : 50000;
        let forceY = Math.abs(forceX * 3);
        jolt.getComponent(cc.RigidBody).applyForceToCenter(cc.v2(forceX, forceY), true);
    }
    //定点雷球
    FX_thunerBall_pos() {
        let thunder = cc.instantiate(this.thunder_one_prefab);
        thunder.setParent(this.node.parent);
        thunder.setSiblingIndex(GameManager.instance.player.getSiblingIndex() + 1);
        thunder.setPosition(GameManager.instance.player.x, this.node.y + 60);
        thunder.getComponent(thunder_chase).damage = this.damage / 4;
        thunder.active = true;
    }
    //扩散雷球 前摇
    FX_thunder_stormBurst1() {
        let burst = cc.instantiate(this.thunder_many_prefab1);
        burst.setParent(this.node.parent);  
        burst.setSiblingIndex(GameManager.instance.player.getSiblingIndex() + 1);
        let x = this.skeleton.node.scaleX > 0 ? this.node.x - 140 : this.node.x + 140;
        let y = this.node.y + 130;
        burst.setPosition(x,y);
        burst.active=true;
        this.scheduleOnce(()=>{
            burst.children[0].getComponent(cc.ParticleSystem3D).stop();
            this.FX_thunder_stormBurst2(burst.getSiblingIndex()+1);
            this.scheduleOnce(()=>{
                burst.destroy();
            },1);
        },0.5);
    }
    //扩散雷球 圈状雷球
    FX_thunder_stormBurst2(index:number) {
        let burst = cc.instantiate(this.thunder_many_prefab2);
        burst.setParent(this.node.parent);
        burst.setSiblingIndex(index);
        let x = this.skeleton.node.scaleX > 0 ? this.node.x - 140 : this.node.x + 140;
        let y = this.node.y + 130;
        burst.setPosition(x,y);
        burst.active=true;
    }
    changeDirection() {
        if (GameManager.instance.player == null) return;
        this.skeleton.node.scaleX = GameManager.instance.player.x - this.node.x > 0 ? -this.scaleX_skeleton : this.scaleX_skeleton;
        //this.hpNode.x = this.skeleton.node.scaleX > 0 ? -28 : 28;
    }
    laugh() {
        this.enemyAnimation.changeState(enemyState.laugh, 1, false, true);
    }
    die() {
        this.isDie = true;
        this.setRigibodySpeed(0, 0);
        this.changeMovState(false);
        this.unscheduleAllCallbacks();
        this.enemyAnimation.changeState(enemyState.die, 1, false, true);
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

    //脚步
    footStep() {
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
