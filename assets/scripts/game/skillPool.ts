// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class skillPool extends cc.Component {

    @property(cc.Prefab)
    swordItem: cc.Prefab = null;
    @property(cc.Prefab)
    swordItem2: cc.Prefab = null;
    @property(cc.Prefab)
    swordSmoke: cc.Prefab = null;
    @property(cc.Prefab)
    rockPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    thunderBallPrefab: cc.Prefab = null;

    swordPool: cc.NodePool = new cc.NodePool("swordItem");
    sword2Pool: cc.NodePool = new cc.NodePool("swordItem2");
    swordSmokePool: cc.NodePool = new cc.NodePool("swordSmoke");
    rockPool: cc.NodePool = new cc.NodePool("rock");
    thunderBallPool: cc.NodePool = new cc.NodePool("thunderBall_burst");

    static instance: skillPool = null;
    onLoad() {
        skillPool.instance = this;
    }
    onDisable() {
        this.rockPool.clear();
        this.swordPool.clear();
        this.sword2Pool.clear();
        this.swordSmokePool.clear();
        this.thunderBallPool.clear();
    }
    start() {
        this.init();
    }
    init() {
        this.createThunderBall();
        this.createSword();
        this.createSword2();
        this.createSwordSmoke();
        this.createRock();
    }
    createThunderBall() {
        for (let i = 0; i < 20; i++) {
            let thunderBall = cc.instantiate(this.thunderBallPrefab);
            thunderBall.name = thunderBall.name + i;
            this.thunderBallPool.put(thunderBall);
        }
    }
    createSword() {
        for (let i = 0; i < 10; i++) {
            let sword = cc.instantiate(this.swordItem);
            sword.active = false;
            this.swordPool.put(sword);
        }
    }
    createSword2() {
        for (let i = 0; i < 12; i++) {
            let sword = cc.instantiate(this.swordItem2);
            this.sword2Pool.put(sword);
        }
    }
    createSwordSmoke() {
        for (let i = 0; i < 15; i++) {
            let smoke = cc.instantiate(this.swordSmoke);
            this.swordSmokePool.put(smoke);
        }
    }
    createRock() {
        for (let i = 0; i < 50; i++) {
            let rock = cc.instantiate(this.rockPrefab);
            this.rockPool.put(rock);
        }
    }
    getThunderBall() {
        let thunderBall = this.thunderBallPool.get();
        if (!thunderBall) {
            thunderBall = cc.instantiate(this.thunderBallPrefab);
            thunderBall.name = thunderBall.name + this.thunderBallPool.size();
        }
        return thunderBall;
    }
    recoveryThunderball(node: cc.Node) {
        this.thunderBallPool.put(node);
    }
    getRock() {
        let rock = this.rockPool.get();
        if (!rock) {
            rock = cc.instantiate(this.rockPrefab);
        }
        return rock;
    }
    recoveryRock(node: cc.Node) {
        this.rockPool.put(node);
    }
    getSwordSmoke() {
        let smoke = this.swordSmokePool.get();
        if (!smoke) {
            smoke = cc.instantiate(this.swordSmoke);
        }
        return smoke;
    }
    recoverySwordSmoke(node: cc.Node) {
        this.swordSmokePool.put(node);
    }
    getSword1() {
        let sword1 = this.swordPool.get();
        if (!sword1) {
            sword1 = cc.instantiate(this.swordItem);
        }
        return sword1;
    }
    recoverySword1(node: cc.Node) {
        this.swordPool.put(node);
    }
    getSword2() {
        let sword2 = this.sword2Pool.get();
        if (!sword2) {
            sword2 = cc.instantiate(this.swordItem2);
        }
        return sword2;
    }
    recoverySword2(node: cc.Node) {
        this.sword2Pool.put(node);
    }
}
