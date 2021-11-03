// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { enemyState, frameEvent_enemy } from "./animationState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class enemyAnimation extends cc.Component {

    enemyName: string = "";
    state: enemyState = enemyState.idle;
    skeleton: sp.Skeleton = null;
    enemyController: any = null;

    //无法变更状态（只可强行改变）
    lockState: Array<enemyState> = [
        enemyState.knock_down,
        enemyState.knock_down1,
        enemyState.knock_down2,
        enemyState.get_up,
        enemyState.Get_up,
        enemyState["Get-up"],
        enemyState["Knock-up-start"],
        enemyState["Knock-up-loop"],
        enemyState["Knock-up-end"],
        enemyState.Knock_up1,
        enemyState.Knock_up2,
        enemyState.Knock_up3
    ];
    onLoad() {
        this.skeleton = this.node.getComponent(sp.Skeleton);
        this.enemyName = this.enemyController.node.name;
    }

    start() {
        //this.debugAnimationName();
        this["setAnimationCompleteEvent_" + this.enemyController.node.name]();
    }
    changeState(state: enemyState, timeScale, isLoop: boolean = false, isCompelChange: boolean = false, isMix: boolean = false) {
        if (this.lockState.includes(enemyState[this.skeleton.animation]) && isCompelChange == false) return;
        this.state = state;
        if (this.state != enemyState.attack && this.state != enemyState.Atk) {
            this.enemyController.hideDamageCollider();
        }
        this.playAnimation(this.getAnimationName(state), timeScale, isLoop, isMix);
    }
    playAnimation(animationName: string, timeScale, isLoop: boolean = false, isMix: boolean = false) {
        if (this.skeleton.findAnimation(animationName) == null) {
            return;
        }
        if (isMix) {
            this.skeleton.setMix(this.skeleton.animation, animationName, 0.1);
        }
        let tarckEntry = this.skeleton.setAnimation(0, animationName, isLoop)
        this.skeleton.timeScale = timeScale;
        this.setTrackEntryEnvet(tarckEntry, animationName);
    }
    getAnimationName(state) {
        return enemyState[state];
    }
    debugAnimationName() {
        //@ts-ignore
        for (let animation of this.skeleton.skeletonData._skeletonCache.animations) {
            console.log(animation.name);
        }
    }
    //设置帧事件
    setTrackEntryEnvet(trackEntry: any, animationName: string) {
        if (frameEvent_enemy[this.enemyName][animationName] == undefined) return;
        this.skeleton.setTrackEventListener(
            trackEntry,
            this.enemyController[frameEvent_enemy[this.enemyName][animationName]].bind(this.enemyController))
    }
    //----------------------以下为绑定动画播放完成监听事件---------------------
    setAnimationCompleteEvent_enemy1() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.get_hurt1:
                    this.enemyController.idle();
                    break;
                case enemyState.get_hurt2:
                    this.enemyController.idle();
                    break;
                case enemyState.knock_down:
                    this.enemyController.getUp();
                    break;
                case enemyState.get_up:
                    this.enemyController.idle();
                    break;
                case enemyState.attack:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_enemy2() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.get_hurt1:
                    this.enemyController.idle(false);
                    break;
                case enemyState.get_hurt2:
                    this.enemyController.idle(false);
                    break;
                case enemyState.knock_down1:
                    this.enemyController.knockDown2();
                    break;
                case enemyState.knock_down2:
                    this.enemyController.getUp();
                    break;
                case enemyState.get_up:
                    this.enemyController.idle();
                    break;
                case enemyState.attack:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_ladyBug() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Atk:
                    this.enemyController.idle();
                    break;
                case enemyState.Behit:
                    //this.enemyController.idle();
                    break;
                case enemyState["Die-start"]:
                    this.enemyController.die_middle();
                    break;
                case enemyState.Die_end:
                    this.enemyController.Destory();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_enemy29() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Atk:
                    this.enemyController.idle();
                    break;
                case enemyState.Hit:
                    this.enemyController.idle();
                    break;
                case enemyState["Knock-up-start"]:
                    this.enemyController.knockDownLoop();
                    break;
                case enemyState["Knock-up-loop"]:
                    this.enemyController.knockDownEnd();
                    break;
                case enemyState["Knock-up-end"]:
                    this.enemyController.getUp();
                    break;
                case enemyState["Get-up"]:
                    this.enemyController.idle();
                    break;
                case enemyState.Die:
                    this.enemyController.head_middle();
                    break;
                case enemyState["Head-end"]:
                    this.enemyController.Destroy();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_enemy10() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.attack:
                    this.enemyController.hitComplete();
                    break;
                case enemyState.skill2_start:
                    this.enemyController.skill2Middle();
                    break;
                case enemyState.skill2_end:
                    this.enemyController.skill2EndComplete();
                    break;
                case enemyState.skill1:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_bigSquid() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Pre_Attack:
                    this.enemyController.rush();
                    break;
                case enemyState.Die1:
                    this.enemyController.die_middle();
                    break;
                case enemyState.Die3:
                    this.enemyController.Destory();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_enemy39() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Born:
                    this.enemyController.bornComplete();
                    break;
                case enemyState.Idle:
                    this.enemyController.idleComplete();
                    break;
                case enemyState.Idle2:
                    this.enemyController.idleComplete();
                    break;
                case enemyState.Idle3:
                    this.enemyController.idleComplete();
                    break;
                case enemyState.Jump_Back:
                    this.enemyController.attackComplete();
                    break;
                case enemyState.Jump_FWD:
                    this.enemyController.attackComplete();
                    break;
                case enemyState.Scratch:
                    this.enemyController.attackComplete();
                    break;
                case enemyState.Above1:
                    this.enemyController.above1Complete();
                    break;
                case enemyState.Above2:
                    this.enemyController.above2Complete();
                    break;
                case enemyState.Die3:
                    this.enemyController.Destory();
                    break;
                case enemyState.Staggered:
                    this.enemyController.StaggeredReset();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_spiderling() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Fall:
                    this.enemyController.born();
                    break;
                case enemyState.Born:
                    this.enemyController.bornComplete();
                    break;
                case enemyState.Knock_up1:
                    this.enemyController.Knock_up2();
                    break;
                case enemyState.Knock_up2:
                    this.enemyController.Knock_up3();
                    break;
                case enemyState.Knock_up3:
                    this.enemyController.getUp();
                    break;
                case enemyState.Get_Hit:
                    if (this.state != enemyState.Get_Hit) return;
                    this.enemyController.idle();
                    break;
                case enemyState.Get_up:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_shader() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Atk:
                    this.enemyController.idle();
                    break;
                case enemyState["Skill-Start"]:
                    this.enemyController.closeCollider();
                    break;
                case enemyState["Skill-Middle"]:
                    this.enemyController.closeCollider();
                    break;
                case enemyState["Skill-End"]:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_enemy20() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.get_hurt1:
                    this.enemyController.idle();
                    break;
                case enemyState.get_hurt2:
                    this.enemyController.idle();
                    break;
                case enemyState.knock_down1:
                    this.enemyController.knockDown2();
                    break;
                case enemyState.get_up:
                    this.enemyController.idle();
                    this.scheduleOnce(() => {
                        if (this.state != enemyState.idle) return;
                        this.enemyController.skill_start();
                    }, 0.5);
                    break;
                case enemyState.fire_pillar:
                    this.enemyController.skill_middle();
                    break;
                case enemyState.fire_pillar3:
                    this.enemyController.idle();
                    break;
                case enemyState.teleport:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_enemy18() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.Atk:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_miniBoss() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.appear:
                    this.enemyController.appearFinished();
                    break;
                case enemyState.blink_start:
                    this.enemyController.binkStartCompelete();
                    break;
                case enemyState.blink_end:
                    this.enemyController.idle();
                    break;
                case enemyState.storm_burst:
                    this.enemyController.idle();
                    break;
                case enemyState.thunder_jolt:
                    this.enemyController.idle();
                    break;
                case enemyState.lighting_chase_start:
                    this.enemyController.lighting_chase_middle();
                    break;
                case enemyState.lighting_chase_end:
                    this.enemyController.idle();
                    break;
                case enemyState.call_of_lighting:
                    this.enemyController.idle();
                    break;
                case enemyState.laugh:
                    this.enemyController.idle();
                    break;
            }
        });
    }
    setAnimationCompleteEvent_miniBossFlag() {
        this.skeleton.setCompleteListener(() => {
            let name = enemyState[this.skeleton.animation];
            switch (name) {
                case enemyState.appear:
                    this.enemyController.appearFinished();
                    break;
                case enemyState.die:
                    this.enemyController.dieEnd();
                    break;
            }
        });
    }
}
