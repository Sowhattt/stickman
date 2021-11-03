// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends cc.Component {
    /**
     * 所属画布节点
     */
    _canvas: cc.Node;
    /**
     * 根节点
     */
    _rootNode: cc.Node;
    /**
     * UI名称
     */
    _uiName: string;
    /**
     * 节点索引
     */
    _zIndex: number;
    /**
     * 设置UI根节点
     * @param node 
     */
    _setRootNode(node: cc.Node) {
        this._rootNode = node;
    }
    /**
     * 设置是否激活UI
     * @param active 是否激活
     */
    _setActive(active: boolean) {
        this._rootNode.active = active;
    }
    /**
     * 设置UI名称
     * @param name UI名称
     */
    _setUIName(name: string) {
        this._uiName = name;
    }
    /**
     * 获得UI名称
     */
    getUIName(): string {
        return this._uiName;
    }
    /**
     * 设置所属画布节点
     * @param canvas - 画布节点
     */
    _setCanvas(canvas: cc.Node) {
        this._canvas = canvas;
    }
    /**
     * 获得画布节点
     */
    getCanvas() {
        return this._canvas;
    }
    /**
     * 设置节点索引
     * @param zIndex 
     */
    _setSiblingIndex(zIndex: number) {
        this._zIndex = zIndex;
        this.node.setSiblingIndex(zIndex);
    }
    /**
     * 获取节点索引
     * @returns number
     */
    getSiblingIndex() {
        return this._zIndex;
    }
    /**
     * 监听层级变化
     */
    onIndexChange(z_index: number) {

    }
    /**
     * UI已加载回调，你可以在这里自定义一些动画或者做一些适配操作
     */
    onUICreate() {

    }
    /**
     * UI释放
     */
    onUIRelease() {

    }
    /**
     * UI启动回调
     * @param args - 打开参数
     */
    onUILaunch(...args: any[]) {

    }
    /**
     * UI关闭回调
     */
    onUIClose() {

    }
}
