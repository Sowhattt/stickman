// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import audioManager from "../main/audioManager";
import { data } from "../sdk/data";
import { attackType, frameEvent, playerAnimationState, skillFrameEventTime } from "./animationState";
import Events from "./Events";
import GameManager from "./GameManager";
import playerCollider from "./playerCollider";
import playerColliderAttack1 from "./playerColliderAttack1";
import playerColliderAttack2 from "./playerColliderAttack2";
import playerPandant from "./playerPandant";
import swordRain from "./swordRain";
import JoyStick from "./ui/Joystick";
import playerControlEvent from "./ui/playerControlEvent";
import playerHp from "./ui/playerHp";
import uiManager from "./ui/uiManager";

enum damageCollider {
    attack1,
    attack2,
    attack3,
    jumpHit
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class playerController extends cc.Component {

    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;


    damageScaleZoom: number = 1;//伤害缩放系数
    damage2ScaleTimes: number = 1.3;//普攻2伤害倍数
    damage3ScaleTimes: number = 2.5;//普攻3伤害倍数
    damageShurikenScaleTimes: number = 5;//手里剑伤害倍数
    damageSwordRainScaleTimes: number = 1;//剑雨伤害倍数
    playerCollider: playerCollider = null;
    moveSpeedBase:number=460;
    speed: number = 460;
    offesetX_aatack3: number = 250;//攻击三位移量
    rigibody: cc.RigidBody = null;
    moveVector: cc.Vec2 = cc.v2(0, 0);
    scaleX: number = 0;
    state: playerAnimationState = playerAnimationState.idle;
    comboAttack: number = 0;
    jumpTimes: number = 0;
    jumpForce_y: number = 340000;//跳跃y轴力
    jumpForce_x: number = 30000;//移动跳跃时x轴力
    roll1Force: number = 400000;//普通翻滚力
    roll2Force: number = 260000;//跳跃上升中翻滚力
    rollDirection: number = 0;
    lastAttackTime: number = 0;
    attack1Finish: boolean = true;
    dmgCollider: damageCollider = null;
    isDie: boolean = false;
    isWuDi: boolean = true;
    finalEnemy: cc.Node = null;
    jumpSoundId:number=-1;
    thunder_chase_cd:boolean=false;
    ground:cc.Node=null;

    //可x轴移动状态
    moveState: Array<playerAnimationState> = [
        playerAnimationState.move,
        playerAnimationState.idle_to_move,
        playerAnimationState.double_jump,
        playerAnimationState.jump_to_move,
        playerAnimationState.jump_start,
        playerAnimationState.jump_down,
        playerAnimationState.jump_attack1,
        playerAnimationState.jump_attack2,
        playerAnimationState.jump_attack3,
        playerAnimationState.roll_to_move
    ];
    //不可改方向状态
    disallowChangeScalex: Array<playerAnimationState> = [
        playerAnimationState.attack1,
        playerAnimationState.attack2,
        playerAnimationState.pose_shadow,
        playerAnimationState.attack3,
        playerAnimationState.get_up,
        playerAnimationState.skill203_air,
        playerAnimationState.skill203_ground,
        playerAnimationState.skill207_air,
        playerAnimationState.skill207_ground,
        playerAnimationState.revive,
        playerAnimationState.die,
        playerAnimationState.knock_up1,
        playerAnimationState.knock_up2,
        playerAnimationState.knock_up3,
        playerAnimationState.bow_attack_fast
    ];
    //不可翻滚状态
    disallowRoll: Array<playerAnimationState> = [
        playerAnimationState.skill203_air,
        playerAnimationState.skill203_ground,
        playerAnimationState.skill207_air,
        playerAnimationState.skill207_ground,
        playerAnimationState.revive,
        playerAnimationState.die,
        playerAnimationState.knock_up1,
        playerAnimationState.knock_up2,
        playerAnimationState.knock_up3,
        playerAnimationState.ultimate
    ];
    //无敌状态
    wudi: Array<playerAnimationState> = [
        playerAnimationState.roll,
        playerAnimationState.roll_air,
        playerAnimationState.skill203_air,
        playerAnimationState.skill203_ground,
        playerAnimationState.skill207_air,
        playerAnimationState.revive,
        playerAnimationState.die,
        playerAnimationState.skill207_ground,
    ];
    jumpSoundState:Array<playerAnimationState>=[
        playerAnimationState.jump_attack1,
        playerAnimationState.jump_attack2,
        playerAnimationState.jump_attack3
    ]
    onLoad() {
        this.scaleX = Math.abs(this.skeleton.node.scaleX);
        this.rigibody = this.node.getComponent(cc.RigidBody);
        this.playerCollider = this.node.getComponent(playerCollider);
        this.speed=Number(data.getCache("Base","playerMoveSpeed"));
        this.ground=this.node.parent.getChildByName("ground");
    }

    start() {
        //@ts-ignore
        //console.log(this.skeleton.skeletonData._skeletonCache.animations);
        this.setAnimationCompleteEvent();
        this.setFrameEventTime();//改变帧事件响应时间
    }
    //登场动画完
    appearEnd() {
        this.isWuDi=false;
        uiManager.ins.showUi();
        JoyStick.instance.init();
        playerControlEvent.instance.init();
        GameManager.instance.enemySpawnM.startSpwan();
        this.idle();
        this.createPandant();
    }
    async createPandant(){
        let pre=await caijiTools.loadPrefab("prefabs/pendant");
        let pandant=cc.instantiate(pre);
        pandant.setParent(this.node.parent);
        pandant.setSiblingIndex(this.node.getSiblingIndex()+1);
        pandant.getComponent(playerPandant).player=this.node;
        pandant.getComponent(playerPandant).init();
    }
    update() {
        //console.log(this.getAnimationName(this.state),this.skeleton.animation);
        this.playerMove();
    }
    playerMove() {
        if (this.state == playerAnimationState.die) return;
        if (this.moveVector.x == 0 && this.state == playerAnimationState.move) {
            this.idle();
            return;
        }
        if (this.moveState.includes(this.state) && this.moveVector.x != 0) {
            this.changeDirection();
            let speed = this.skeleton.node.scaleX > 0 ? this.speed : -this.speed;
            this.rigibody.linearVelocity = cc.v2(speed, this.rigibody.linearVelocity.y);
        }
        if (this.skeleton.animation == playerAnimationState[playerAnimationState.idle]
            && this.moveVector.x != 0
            && this.attack1Finish) {
            this.changeState(playerAnimationState.idle_to_move);
        }
    }
    //摇杆监听事件
    move(vector: cc.Vec2) {
        this.moveVector = vector;
        if (this.moveVector.x != 0) {
            if (this.disallowChangeScalex.includes(this.state)) return;
            this.skeleton.node.scaleX = vector.x > 0 ? this.scaleX : -this.scaleX;
            if (this.skeleton.node.scaleX == this.rollDirection) return;
            switch (this.state) {
                case playerAnimationState.roll:
                    if (this.playerCollider.isFlying) {
                        this.changeState(playerAnimationState.jump_down);
                    } else {
                        this.changeState(playerAnimationState.move);
                    }
                    break;
                case playerAnimationState.roll_air:
                    if (this.playerCollider.isFlying) {
                        this.changeState(playerAnimationState.jump_down);
                    } else {
                        this.changeState(playerAnimationState.move);
                    }
                    break;
                case playerAnimationState.roll_to_idle:
                    this.changeState(playerAnimationState.move);
                    break;
                case playerAnimationState.roll_to_move:
                    this.changeState(playerAnimationState.move);
                    break;
            }
        }
    }
    changeDirection() {
        if (this.moveVector.x != 0) {
            this.skeleton.node.scaleX = this.moveVector.x > 0 ? this.scaleX : -this.scaleX;
        }
    }
    showDamageCollider(collider: damageCollider) {
        this.skeleton.node.children[collider].active = true;
        this.dmgCollider = collider;
    }
    hideDamageCollider() {
        if (this.dmgCollider == null) return;
        this.skeleton.node.children[this.dmgCollider].active = false;
        this.dmgCollider = null;
    }
    beHit(enemy: cc.Node, dmg: number, isKnockDown: boolean = false) {
/*         if (this.state == playerAnimationState.idle) {
            let force = 40000;
            force = this.node.x > enemy.x ? force : -force;
            this.rigibody.applyForceToCenter(cc.v2(force, 0), true);
        } */
        if(this.isDie) return;
        let scalex = enemy.x > this.node.x ? -1 : 1;
        let offsetX = caijiTools.random_int(-40, 40);
        if (this.wudi.includes(this.state) || this.isWuDi) {
            if (this.isWuDi) {
                Events.instance.showDamageLabel_player(this.node, 0, offsetX);
                Events.instance.showEnemyHitEffect(this.node.parent, cc.v2(this.node.x + caijiTools.random_int(-15, 15), this.node.y + 60), scalex);
            }
            return;
        }
        this.finalEnemy = enemy;
        this.highLight();
        playerHp.instance.updateHp(dmg);
        Events.instance.showDamageLabel_player(this.node, dmg, offsetX);
        Events.instance.showEnemyHitEffect(this.node.parent, cc.v2(this.node.x + caijiTools.random_int(-15, 15), this.node.y + 60), scalex);
        if (isKnockDown && this.isDie==false) {
            playerControlEvent.instance.removeEvent();
            this.changeState(playerAnimationState.knock_up1);
        }
    }
    highLight() {
        this.unschedule(this.closeHighLight);
        this.skeleton.getMaterial(0).setProperty("beHit", 1);
        this.skeleton.getMaterial(0).setProperty("highLightColor", [0.8, 0.0, 0.0, 0.5]);
        this.scheduleOnce(this.closeHighLight, 0.2);
    }
    closeHighLight() {
        this.skeleton.getMaterial(0).setProperty("beHit", 0);
    }
    die() {
        playerControlEvent.instance.removeEvent();
        uiManager.ins.lose();
        this.changeState(playerAnimationState.die);
        this.closeBoxCollider();
        this.skeleton.node.scaleX = this.finalEnemy.x > this.node.x ? this.scaleX : -this.scaleX;
    }
    revive() {
        this.changeState(playerAnimationState.revive);
        Events.instance.showReviveFx(this.node);
    }
    closeBoxCollider() {
        this.isDie = true;
        this.node.getComponent(cc.BoxCollider).enabled = false;
    }
    openBoxCollider() {
        this.isDie = false;
        this.node.getComponent(cc.BoxCollider).enabled = true;
        playerHp.instance.addHp(playerHp.instance.hp_max, true);
        this.changeState(playerAnimationState.idle);
        this.openWuDi(5);
        playerControlEvent.instance.bindingEvent();
    }
    openWuDi(wudiTime: number) {
        this.isWuDi = true;
        let shieldNode: cc.Node = this.node.getChildByName("shield");
        shieldNode.active = true;
        for (let child of shieldNode.children) {
            if (child.getComponent(cc.ParticleSystem3D)) {
                child.getComponent(cc.ParticleSystem3D).loop = true;
            }
        }
        this.scheduleOnce(() => {
            this.closeWuDi();
        }, wudiTime - 2);
    }
    closeWuDi() {
        let shieldNode: cc.Node = this.node.getChildByName("shield");
        for (let child of shieldNode.children) {
            if (child.getComponent(cc.ParticleSystem3D)) {
                child.getComponent(cc.ParticleSystem3D).loop = false;
            }
        }
        this.scheduleOnce(() => {
            this.isWuDi = false;
            shieldNode.active = false;
        }, 2);
    }
    idle() {
        this.jumpTimes = 0;
        this.changeState(playerAnimationState.idle);
    }
    attack() {
        if (this.playerCollider.isFlying == false) {
            this.addCombo();
        }
        switch (this.state) {
            case playerAnimationState.move:
                this.changeState(playerAnimationState.attack1);
                break;
            case playerAnimationState.idle:
                this.changeState(playerAnimationState.attack1);
                break;
            case playerAnimationState.idle_to_move:
                this.changeState(playerAnimationState.attack1);
                break;
            default:
                if (this.playerCollider.isFlying) {
                    //空中时
                    if (this.getAnimationName(this.state).includes("jump_attack")
                        || this.getAnimationName(this.state).includes("skill")) return;
                    this.jumpAttack();
                }
        }
    }
    addCombo() {
        this.lastAttackTime = this.lastAttackTime == 0 ? cc.director.getTotalTime() / 1000 : this.lastAttackTime;
        if ((cc.director.getTotalTime() / 1000 - this.lastAttackTime) < 0.3/playerHp.instance.speedTimes || this.comboAttack == 0) {
            this.comboAttack++;
        }
        this.comboAttack = this.comboAttack > 3 ? 3 : this.comboAttack;
        this.lastAttackTime = cc.director.getTotalTime() / 1000;
        //console.log(cc.director.getTotalTime()/1000-this.lastAttackTime,this.comboAttack);
    }
    resetCombo() {
        this.comboAttack = 0;
    }
    roll() {
        if (this.disallowRoll.includes(this.state)) return;
        this.rollDirection = this.skeleton.node.scaleX;
        if (this.playerCollider.isFlying == false) {
            this.roll_1();
        } else {
            if (this.rigibody.linearVelocity.y > 0) {
                this.roll_2();
            } else {
                this.roll_1();
            }
        }
    }
    //地面和降落中翻滚
    roll_1() {
        audioManager.playAudio(audioName.rolldash);
        this.rigibody.linearDamping = 3;
        let forceX = this.skeleton.node.scaleX > 0 ? this.roll1Force : -this.roll1Force;
        this.rigibody.linearVelocity = cc.v2(0, this.rigibody.linearVelocity.y);
        this.rigibody.applyForce(cc.v2(forceX, 0), this.rigibody.getWorldCenter(), true);
        if (this.jumpTimes == 2) {
            this.rigibody.applyForce(cc.v2(0, -100000), this.rigibody.getWorldCenter(), true);
        }
        this.changeState(playerAnimationState.roll);
    }
    //起跳中翻滚
    roll_2() {
        audioManager.playAudio(audioName.rolldash);
        this.rigibody.linearDamping = -0.5;
        let forceX = this.skeleton.node.scaleX > 0 ? this.roll2Force : -this.roll2Force;
        this.rigibody.linearVelocity = cc.v2(0, this.rigibody.linearVelocity.y);
        this.rigibody.applyForce(cc.v2(forceX, 10000), this.rigibody.getWorldCenter(), true);
        this.changeState(playerAnimationState.roll_air);
    }
    jump() {
        if (this.jumpTimes >= 2) return;
        let forceX = this.skeleton.node.scaleX > 0 ? this.jumpForce_x : -this.jumpForce_x;
        forceX = this.moveVector.x == 0 ? 0 : forceX;
        this.rigibody.linearDamping = 1;
        switch (this.state) {
            case playerAnimationState.idle:
                this.jump_1(forceX);
                break;
            case playerAnimationState.idle_to_move:
                this.jump_1(forceX);
                break;
            case playerAnimationState.move:
                this.jump_1(forceX);
                break;
            case playerAnimationState.jump_start:
                this.jump_2(forceX);
                break;
            case playerAnimationState.jump_down:
                this.jump_2(forceX);
                break;
            case playerAnimationState.jump_end:
                this.jump_1(forceX);
                break;
            case playerAnimationState.jump_to_move:
                this.jump_1(forceX);
                break;
            default:
                let num = this.jumpTimes + 1;
                if (this.getAnimationName(this.state).includes("roll")) {
                    //翻滚->跳跃
                    this["jump_" + num](forceX);
                    return;
                } else if (this.getAnimationName(this.state).includes("jump_attack")) {
                    //空中攻击->跳跃
                    this["jump_" + num](forceX);
                    return;
                } else if (this.getAnimationName(this.state).includes("attack")) {
                    //地面攻击->跳跃
                    this.jump_1(forceX);
                    return;
                }
        }
    }
    //第一段跳跃
    jump_1(forceX: number) {
        audioManager.playAudio(audioName.jump,false,0.6);
        this.jumpTimes++;
        this.rigibody.applyForce(cc.v2(forceX, this.jumpForce_y), this.rigibody.getWorldCenter(), true);
        this.changeState(playerAnimationState.jump_start);
    }
    //第二段跳跃
    jump_2(forceX: number) {
        audioManager.playAudio(audioName.jump,false,0.6);
        this.jumpTimes++;
        this.rigibody.linearVelocity = cc.v2(this.rigibody.linearVelocity.x, 0);
        this.rigibody.applyForce(cc.v2(forceX, this.jumpForce_y), this.rigibody.getWorldCenter(), true);
        this.changeState(playerAnimationState.double_jump);
    }
    async jumpAttack() {
        let forceY = this.rigibody.linearVelocity.y <= 0 ? this.jumpForce_y * 0.7 : this.jumpForce_y;
        this.rigibody.linearVelocity = cc.v2(this.rigibody.linearVelocity.x, 0);
        this.rigibody.applyForce(cc.v2(0, forceY), this.rigibody.getWorldCenter(), true);
        this.rigibody.linearDamping = forceY == 0 ? 12 : 0;
        this.changeState(playerAnimationState.jump_attack1);
        this.jumpSoundId=await audioManager.playAudio(audioName.SpinAttack,false);
    }
    dropToGround() {
        this.jumpTimes = 0;
        this.rigibody.linearDamping = 0;//1;
        this.resetCombo();
        audioManager.playAudio(audioName.Jumpland);
        if (this.state == playerAnimationState.idle || this.state == playerAnimationState.die) return;
        if (this.getAnimationName(this.state).includes("roll")) {
            if (this.state == playerAnimationState.roll_air) {
                this.rigibody.linearVelocity = cc.v2(0, 0);
                if (this.moveVector.x == 0) {
                    this.changeState(playerAnimationState.jump_end);
                } else {
                    this.changeState(playerAnimationState.jump_to_move);
                }
            }
            return;
        }
        if (this.getAnimationName(this.state).includes("jump_attack")) {
            //攻击落地
            this.changeState(playerAnimationState.jump_attack3);
        } else {
            //跳跃落地
            if (this.moveVector.x != 0) {
                //跳->跑
                this.changeState(playerAnimationState.jump_to_move);
            } else {
                //跳->站立
                this.rigibody.linearVelocity = cc.v2(0, 0);
                this.changeState(playerAnimationState.jump_end);
            }
        }
    }
    skill1() {
        if (this.skeleton.animation.includes("skill") == false) {
            this.resetCombo();
            this.rigibody.linearVelocity = cc.v2(0, 0);
            audioManager.playAudio(audioName.Skillcast207Shuriken);
            if (this.playerCollider.isFlying) {
                //空中释放 
                this.closeGravity();
                this.changeState(playerAnimationState.skill207_air);
            } else {
                this.changeState(playerAnimationState.skill207_ground);
            }
        }
    }
    async createShuriken() {
        let prefab = await caijiTools.loadPrefab("prefabs/shuriken");
        let shuriken = caijiTools.createNode(prefab, this.node.parent);
        shuriken.setPosition(this.node.x, this.node.y + 70);
        shuriken.setSiblingIndex(shuriken.getSiblingIndex() - 1);
    }
    skill2() {
        if (this.skeleton.animation.includes("skill") == false) {
            this.resetCombo();
            this.rigibody.linearVelocity = cc.v2(0, 0);
            if (this.playerCollider.isFlying) {
                //空中释放
                this.closeGravity();
                this.changeState(playerAnimationState.skill203_air);
            } else {
                this.changeState(playerAnimationState.skill203_ground);
            }
        }
    }
    async createSwordRain() {
        let prefab = await caijiTools.loadPrefab("prefabs/swordRain");
        let swordRainNode = caijiTools.createNode(prefab, this.node.parent);
        swordRainNode.setSiblingIndex(this.ground.getSiblingIndex());
        swordRainNode.setPosition(this.node.x, 230);
        swordRainNode.getComponent(swordRain).isRight = this.skeleton.node.scaleX > 0 ? true : false;
    }
    closeGravity() {
        this.rigibody.type = cc.RigidBodyType.Kinematic;
    }
    openGravity() {
        this.rigibody.type = cc.RigidBodyType.Dynamic;
        this.scheduleOnce(() => {
            this.rigibody.applyForce(cc.v2(0, -180000), this.rigibody.getWorldCenter(), true);
        }, 0);
    }
    setFriction(friction: number) {
        this.node.getComponent(cc.PhysicsBoxCollider).friction = friction;
        this.node.getComponent(cc.PhysicsBoxCollider).apply();
    }
    changeState(state: playerAnimationState) {
        this.hideDamageCollider();
        if (this.getAnimationName(state).includes("attack") == false) {
            this.resetCombo();
        }
        if(this.jumpSoundId!=-1&&this.jumpSoundState.includes(state)==false){
            audioManager.stopAudio(this.jumpSoundId);
            this.jumpSoundId=-1;
        }
        this.state = state;
        this['enterStateEvent_' + this.getAnimationName(state)](state);
        if (playerControlEvent.instance.isContinueAttack && this.state == playerAnimationState.idle) {
            //idle状态下连续攻击
            this.changeDirection();
            this.changeState(playerAnimationState.attack1);
        }

    }
    getAnimationName(state: playerAnimationState) {
        return playerAnimationState[state];
    }
    playAnimation(animationName: string, timeScale, isLoop: boolean = false) {
        if (animationName == this.skeleton.animation) {
            return;
        }
        if (this.skeleton.animation == "attack1" && animationName == "idle") {
            this.skeleton.setMix(this.skeleton.animation, animationName, 0.3);
            this.scheduleOnce(() => {
                this.attack1Finish = true;
            }, 0.1);
        } else if (this.skeleton.animation == "double_jump" && animationName == "roll_air") {
            //this.skeleton.setMix(this.skeleton.animation, animationName, 0.1);
        }
        let trackEntry = this.skeleton.setAnimation(0, animationName, isLoop);
        this.setTrackEntryEnvet(trackEntry, animationName);
        this.skeleton.timeScale = timeScale;
        // if (animationName == this.getAnimationName(playerAnimationState.attack1)) {
        //     this.skeleton.addAnimation(0, this.getAnimationName(playerAnimationState.attack2), false, 0.2);
        //     this.skeleton.addAnimation(0, this.getAnimationName(playerAnimationState.attack3), false, 0.2);
        // }
    }
    setAnimationCompleteEvent() {
        this.skeleton.setCompleteListener(() => {
            let name = playerAnimationState[this.skeleton.animation];
            switch (name) {
                case playerAnimationState.appear:
                    this.appearEnd();
                    break;
                case playerAnimationState.idle_to_move:
                    this.anyToIdleOrJump();
                    break;
                case playerAnimationState.pose_shadow:
                    this.changeState(playerAnimationState.attack3);
                    break;
                case playerAnimationState.attack3:
                    this.idle();
                    break;
                case playerAnimationState.jump_start:
                    this.changeState(playerAnimationState.jump_down);
                    break;
                case playerAnimationState.double_jump:
                    this.rigibody.linearDamping = -3;
                    break;
                case playerAnimationState.jump_end:
                    this.changeState(playerAnimationState.idle);
                    break;
                case playerAnimationState.jump_to_move:
                    this.changeState(playerAnimationState.move);
                    break;
                case playerAnimationState.jump_attack1:
                    this.changeState(playerAnimationState.jump_attack2);
                    break;
                case playerAnimationState.jump_attack3:
                    this.anyToIdleOrJump();
                    break;
                case playerAnimationState.roll:
                    this.rollToIdleOrMove();
                    break;
                case playerAnimationState.roll_to_idle:
                    this.idle();
                    break;
                case playerAnimationState.roll_to_move:
                    this.changeState(playerAnimationState.move);
                    break;
                case playerAnimationState.revive:
                    this.openBoxCollider();
                    break;
                case playerAnimationState.knock_up1:
                    this.changeState(playerAnimationState.knock_up2);
                    break;
                case playerAnimationState.knock_up2:
                    this.changeState(playerAnimationState.knock_up3);
                    break;
                case playerAnimationState.knock_up3:
                    this.scheduleOnce(()=>{
                        if(this.state==playerAnimationState.knock_up3){
                            this.changeState(playerAnimationState.get_up);
                        }
                    },0.2);
                    break;
                case playerAnimationState.get_up:
                    this.idle();
                    playerControlEvent.instance.bindingEvent();
                    break;
                default:
                    if (this.skeleton.animation.includes("skill")) {
                        if (this.playerCollider.isFlying) {
                            this.openGravity();
                            this.changeState(playerAnimationState.jump_down);
                        } else {
                            this.changeState(playerAnimationState.idle);
                        }
                    }
                    break;
            }
        });
    }
    rollToIdleOrMove() {
        if (this.moveVector.x == 0) {
            this.changeState(playerAnimationState.roll_to_idle);
        } else {
            this.changeState(playerAnimationState.roll_to_move);
        }
    }
    anyToIdleOrJump() {
        if (this.moveVector.x == 0) {
            this.changeState(playerAnimationState.idle);
        } else {
            this.changeState(playerAnimationState.move);
        }
    }
    //--------------------以下为动画帧事件事件-------------------------------------------
    setAnimationFrameEvent(animationName: string) {
        if (frameEvent[animationName] == undefined) return;
        this.skeleton.setEventListener(this[frameEvent[animationName]].bind(this));
    }
    setTrackEntryEnvet(trackEntry: any, animationName: string) {
        if (frameEvent[animationName] == undefined) return;
        this.skeleton.setTrackEventListener(trackEntry, this[frameEvent[animationName]].bind(this));
    }
    setFrameEventTime() {
        this.skeleton.findAnimation("skill207_ground").timelines[59].frames[0] = skillFrameEventTime.skill207_ground;
        this.skeleton.findAnimation("skill207_air").timelines[65].frames[0] = skillFrameEventTime.skill207_air;
        this.skeleton.findAnimation("skill203_ground").timelines[56].frames[0] = skillFrameEventTime.skill203_ground;
        this.skeleton.findAnimation("skill203_air").timelines[58].frames[0] = skillFrameEventTime.skill203_air;
        this.skeleton.findAnimation("attack1").timelines[68].frames[2] = skillFrameEventTime.attack1;
        this.skeleton.findAnimation("attack2").timelines[72].frames[2] = skillFrameEventTime.attack2;
    }
    AddForceUp(trackEntry, event) {
        console.log("AddForceUp");
    }
    AnimationEnd(trackEntry, event) {
        console.log("AnimationEnd");
    }
    Attack1(trackEntry, event) {
        //console.log(event);//"MoveForward" "LockDirection" "StopMove""AttackComplete"
        if (event.data.name == "StopMove") {
            let dmg: number = playerHp.instance.damageScale * this.damageScaleZoom;
            this.skeleton.node.children[this.dmgCollider].getComponent(playerColliderAttack1).hit(dmg, attackType.attack1);
        }
    }
    Attack2(trackEntry, event) {
        //console.log(event);
        if (event.data.name == "StopMove") {
            let dmg: number = playerHp.instance.damageScale * this.damageScaleZoom * this.damage2ScaleTimes;
            this.skeleton.node.children[this.dmgCollider].getComponent(playerColliderAttack2).hit(dmg, attackType.attack2);
        }
    }
    Attack3(trackEntry, event) {
        //console.log(trackEntry);
    }
    FootStep(trackEntry, event) {
        //console.log("FootStep");
        if(event.time>0.2) return;
        audioManager.playAudio(audioName.Run);
    }
    GetUp(trackEntry, event) {
        //console.log("GetUp");
    }
    LockDirection(trackEntry, event) {
        //console.log("LockDirection");
    }
    MoveForward(trackEntry, event) {
        //console.log("MoveForward");
    }
    RollComplete(trackEntry, event) {
        //console.log("RollComplete");
    }
    SkillComplete(trackEntry, event) {
        //技能投掷帧事件
        if (this.skeleton.animation.includes("207")) {
            //console.log("shuriken");
            this.createShuriken();
        } else {
            //console.log("swordRain");
            this.createSwordRain();
            audioManager.playAudio(audioName.Kunai);
        }
    }
    StopMove(trackEntry, event) {
        //console.log("StopMove");
        audioManager.playAudio(audioName.StopMove);
    }
    //--------------------以下为changeState事件-------------------------------------------
    enterStateEvent_idle(state: playerAnimationState) {
        this.rigibody.linearVelocity = cc.v2(0, this.rigibody.linearVelocity.y);
        this.playAnimation(playerAnimationState[state], 1, true);
    }
    enterStateEvent_idle_to_move(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 3, false);
    }
    enterStateEvent_move(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1.2, true);
    }
    enterStateEvent_attack1(state: playerAnimationState) {
        this.showDamageCollider(damageCollider.attack1);
        this.attack1Finish = false;
        this.rigibody.linearVelocity = cc.v2(0, this.rigibody.linearVelocity.y);
        this.node.x = this.skeleton.node.scaleX > 0 ? this.node.x + 0 : this.node.x - 0;//位移
        this.playAnimation(playerAnimationState[state], 1*playerHp.instance.speedTimes, false);

        this.scheduleOnce(() => {
            //attack1动作结束
            if (playerAnimationState[this.skeleton.animation] != playerAnimationState.attack1) return;
            if (playerControlEvent.instance.isContinueAttack || this.comboAttack > 1) {
                this.changeState(playerAnimationState.attack2);
            } else {
                this.changeState(playerAnimationState.idle);
            }
        }, 0.26/playerHp.instance.speedTimes);
    }
    enterStateEvent_attack2(state: playerAnimationState) {
        this.showDamageCollider(damageCollider.attack2);
        this.attack1Finish = true;
        this.playAnimation(playerAnimationState[state], 1*playerHp.instance.speedTimes, false);
        this.changeDirection();
        let offsetx = this.skeleton.node.scaleX > 0 ? this.offesetX_aatack3 : -this.offesetX_aatack3;//位移
        this.rigibody.linearVelocity = cc.v2(offsetx, 0);
        this.scheduleOnce(() => {
            //attack2动作结束
            if (playerAnimationState[this.skeleton.animation] != playerAnimationState.attack2) return;
            if (playerControlEvent.instance.isContinueAttack || this.comboAttack > 2) {
                this.changeState(playerAnimationState.pose_shadow);
            } else {
                this.changeState(playerAnimationState.idle);
            }
        }, 0.32/playerHp.instance.speedTimes);
    }
    enterStateEvent_pose_shadow(state: playerAnimationState) {
        audioManager.playAudio(audioName.thrust1);
        this.playAnimation(playerAnimationState[state], 1, false);
        this.changeDirection();
        this.rigibody.linearVelocity = cc.v2(0, 0);
        this.scheduleOnce(() => {
            if (playerAnimationState[this.skeleton.animation] != playerAnimationState.pose_shadow) return;
            this.changeState(playerAnimationState.attack3);
        }, 0.05);
    }
    enterStateEvent_attack3(state: playerAnimationState) {
        this.state = state;
        this.playAnimation(playerAnimationState[state], 1.1*playerHp.instance.speedTimes, false);
        this.scheduleOnce(() => {
            //attack3动作冲刺开始
            if (playerAnimationState[this.skeleton.animation] == playerAnimationState.attack3) {
                let offsetx = this.skeleton.node.scaleX > 0 ? 
                800*playerHp.instance.speedTimes :
                 -800*playerHp.instance.speedTimes;//位移
                this.rigibody.linearVelocity = cc.v2(offsetx, 0);
                this.showDamageCollider(damageCollider.attack3);
            }
            this.scheduleOnce(() => {
                //attack3动作冲刺结束
                this.hideDamageCollider();
                if (playerAnimationState[this.skeleton.animation] == playerAnimationState.attack3) {
                    this.rigibody.linearVelocity = cc.v2(0, 0);
                }
            }, 0.2/playerHp.instance.speedTimes);
        }, 0.24/playerHp.instance.speedTimes);
    }
    enterStateEvent_jump_start(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_double_jump(state: playerAnimationState) {
        this.rigibody.linearDamping = 1;
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_jump_down(state: playerAnimationState) {
        this.rigibody.linearDamping = 0;
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_jump_end(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_jump_to_move(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_jump_attack1(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_jump_attack2(state: playerAnimationState) {
        this.showDamageCollider(damageCollider.jumpHit);
        this.playAnimation(playerAnimationState[state], 1.3*playerHp.instance.speedTimes, true);
    }
    enterStateEvent_jump_attack3(state: playerAnimationState) {
        this.rigibody.linearVelocity = cc.v2(0, 0);
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_roll(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1.3, false);
    }
    enterStateEvent_roll_air(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_roll_to_idle(state: playerAnimationState) {
        this.rigibody.linearVelocity = cc.v2(0, this.rigibody.linearVelocity.y);
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_roll_to_move(state: playerAnimationState) {
        this.rigibody.linearVelocity = cc.v2(0, this.rigibody.linearVelocity.y);
        this.playAnimation(playerAnimationState[state], 1.1, false);
    }
    enterStateEvent_skill203_air(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1*playerHp.instance.speedTimes, false);
    }
    enterStateEvent_skill203_ground(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1*playerHp.instance.speedTimes, false);
    }
    enterStateEvent_skill207_air(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1*playerHp.instance.speedTimes, false);
    }
    enterStateEvent_skill207_ground(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1*playerHp.instance.speedTimes, false);
    }
    enterStateEvent_die(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_revive(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_knock_up1(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_knock_up2(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_knock_up3(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
    enterStateEvent_get_up(state: playerAnimationState) {
        this.playAnimation(playerAnimationState[state], 1, false);
    }
}
