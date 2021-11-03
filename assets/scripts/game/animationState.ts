import miniBoss from "./miniBossFlag"

export enum playerAnimationState{
    appear,//从天而降
    attack1,
    attack2,
    attack3,
    bow_attack,//慢弓
    bow_attack_fast,//快弓
    bow_attack_to_idle,
    dash_air,//空中冲击
    die,
    double_jump,//二连跳
    get_hurt,
    get_up,//起身
    idle,
    idle_to_move,
    jump_attack1,//空中普攻起手
    jump_attack2,//空中旋转攻击
    jump_attack3,//空中旋转攻击落地
    jump_attack4,
    jump_demo,
    jump_down,//降落
    jump_end,//idle落地
    jump_start,//起跳
    jump_to_move,//move落地
    knock_up1,//被击倒地
    knock_up2,
    knock_up3,
    move, //奔跑动作1
    move1,//奔跑动作2
    move2,//奔跑动作3
    pose_shadow,//第三次共击冲击pose
    revive,
    roll,//地上翻滚
    roll_air,//空中翻滚  跳跃后立即翻滚时
    roll_to_idle,
    roll_to_move,
    skill203_air, //空中剑雨技
    skill203_ground,//地上剑雨技
    skill203_old,
    skill207_air,//空中扔飞镖
    skill207_ground,//地上扔飞镖
    ultimate//大招
}
export enum enemyName{
    enemy1="enemy1",  //普通怪
    enemy2="enemy2",  //弓箭手
    enemy29="enemy29", //匕首怪
    enemy10="enemy10", //胖子boss
    ladyBug="ladyBug", //瓢虫
    bigSquid="bigSquid", //蚊子
    enemy39="enemy39",  //蜘蛛女王boss
    spiderling="spiderling", //小蜘蛛
    shader="shader",  //卡赞
    enemy20="enemy20", //女巫
    enemy18="enemy18", //棒槌怪
    miniBoss="miniBoss",//雷电法王boss
    miniBossFlag="miniBossFlag"//雷电法王招雷旗
}
//玩家帧事件 nail为未绑定状态
export enum frameEvent{
    nail1="AddForceUp",
    nail2="AnimationEnd",
    attack1="Attack1",
    attack2="Attack2",
    attack3="Attack3",
    move="FootStep",
    get_up="GetUp",
    nail6="LockDirection",
    nail7="MoveForward",
    nail8="RollComplete",
    skill203_air="SkillComplete",
    skill203_ground="SkillComplete",
    skill207_air="SkillComplete",
    skill207_ground="SkillComplete",
    nail10="StopMove"
}
//怪物帧事件（怪物名-动画名-帧事件方法名）
export const frameEvent_enemy={
    "enemy1":{},
    "enemy2":{
        "attack":"shootArrow"
    },
    "enemy29":{},
    "ladyBug":{
        "Atk":"fire"
    },
    "enemy10":{
        "skill2_start":"footStep",
        "skill2_middle":"footStep",
        "skill1":"frameEvent_skill1"
    },
    "bigSquid":{},
    "enemy39":{
        "Move":"footStep"
    },
    "spiderling":{
        "Fall":"attack_fall"
    },
    "shader":{},
    "enemy20":{
        "teleport":"blink"
    },
    "enemy18":{
        "Atk":"Shake"
    },
    "miniBoss":{
    },
    "miniBossFlag":{}
}
//玩家触发技能的帧时间
export const skillFrameEventTime={
    skill203_air:0.5,
    skill203_ground:0.48,
    skill207_air:0.43,
    skill207_ground:0.43,
    attack1:0.123,
    attack2:0.23
}
//玩家伤害类型
export enum attackType{
    attack1,
    attack2,
    attack3,
    jumpHit,
    shuriken,
    swordRain
}
//怪物名对应的控制脚本名（玩家攻击判定时获取怪物脚本组件）
export const enemyScript={
    "enemy1":"E1controller",
    "enemy2":"E2controller",
    "ladyBug":"ladyBug",
    "enemy29":"E29controller",
    "enemy10":"E10controller",
    "bigSquid":"bigSquidController",
    "enemy39":"E39controller",
    "spiderling":"spiderlingController",
    "shader":"shaderController",
    "enemy20":"E20controller",
    "enemy18":"E18controller",
    "miniBoss":"miniBossController",
    "miniBossFlag":"miniBossFlag"
}
//enemy状态
export enum enemyState{
    attack,   //E1----------普通怪
    get_hurt1,//被击前倾
    get_hurt2,//被击后仰
    get_up,//起身
    idle,
    knock_down,//击飞
    move,//拿刀走
    move2,//举刀走
    run,//举刀跑

    //attack,  //E2----------弓箭手
    //get_hurt1,
    //get_hurt2,
    //get_up,
    //idle,
    knock_down1,//倒地动作
    knock_down2,//躺尸
    //move

    Atk,   //ladyBug----------瓢虫
    Behit,
    Idle,
    "Die-middle",
    "Die-start",
    "Die_end",

    //Atk,   //E29----------匕首怪
    Die,   //死亡掉头
    "Get-up",
    "Head-end", //头爆炸
    "Head-middle",//头缩放
    Hit,       //被击
    //Idle,
    "Knock-up-end", //倒地
    "Knock-up-loop",//击飞空中静止动作
    "Knock-up-start",//击飞开始
    Move,

    //attack,  掌击 //E10-------------胖子boss
    die,
    get_hurt,
    //idle,
    //move,
    skill1,  //泰山压顶
    skill2_end,//冲击结束
    skill2_middle,//冲击保持
    skill2_start,  //冲击开始

    Attack,  //bigSquid-----蚊子
    Attack_End,
    Die1,
    Die2,
    Die3,
    //Idle,
    //Move,
    Pre_Attack, //准备攻击动作
    //get_hurt1

    Above1,  //起跳   enemy39----------蜘蛛女王
    Above2,  //降落
    Born,  
    //Die,
    Get_Hit,
    //Idle,  
    Idle2,
    Idle3,
    Jump_Back,  //后跳眼睛发射激光
    Jump_FWD,   //前跳爪击
    //Move,
    Scratch,  //腿击
    Staggered,  //虚弱
    StaggeredReset,

    //Attack,  //spiderling-----------小蜘蛛
    //Born,
    //Die,
    Fall,
    //Get_Hit,
    Get_up,
    //Idle,
    Knock_up1,
    Knock_up2,
    Knock_up3,
    //Move,
    Stop,
    Warning,

    //Atk,  //shader----------------卡赞
    //Behit,
    //Die,
    //Idle,
    "Skill-End",  //换位置出现
    "Skill-Middle", //出现-斩击-隐身
    "Skill-Start",  //举刀隐身

    fire_pillar,    //魔法开始    //enemy20-------------女巫
    fire_pillar2,   //魔法持续
    fire_pillar3,   //魔法结束
    //get_hurt1,
    //get_hurt2,
    //get_up,
    //idle,
    //knock_down1,
    //knock_down2,
    //move,
    teleport,  //传送

    //Atk,   //enemy18--------------棒槌怪
    //Behit,
    //Idle,
    //Move,

    appear,  //miniBoss------------雷电法王
    blink_end,  //瞬移结束
    blink_start,  //瞬移开始
    call_of_lighting,  //召唤旗帜
    //die,
    //get_hurt,
    //idle,
    laugh,
    lighting_chase_end,
    lighting_chase_middle, //持续召唤静态雷球（持续多段伤害）
    lighting_chase_start,
    //move,
    staggered_end,
    staggered_middle,
    staggered_start,
    storm_burst,  //召唤扩散雷球（爆炸单段伤害）
    thunder_jolt,   //召唤滚雷

    appear2,  //旗帜
    warning,
    //die,
    //idle
}
