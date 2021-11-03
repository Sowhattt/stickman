export default interface mEvent {
    /** 事件名称 */
    name: string;
    /** 事件回调 */
    callback: Function;
    /** 监听对象 */
    target: any;
}
export default class mEvent implements mEvent {
    name: string;
    /** 事件回调 */
    onBack: Function;
    /** 监听对象 */
    target: any;

    // 函数重载
    constructor();
    constructor(name: string, callback: Function, target: any);
    // 初始化传参处理
    constructor(name?: string, callback?: Function, target?: any) {
        this.name = name;
        this.callback = callback;
        this.target = target;
    }
}
