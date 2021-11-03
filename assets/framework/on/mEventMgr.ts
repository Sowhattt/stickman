import mEvent from "./mEvent";
const TAG = 'mEventMgr.ts';
class mEventMgr {
    private static _Instance: mEventMgr = null;
    static getInstance() {
        if (mEventMgr._Instance == null) {
            mEventMgr._Instance = new mEventMgr();
        }
        return mEventMgr._Instance;
    }
    /** 事件Item */
    private _eventList: Map<string, Array<mEvent>> = null;
    /** 构造函数 */
    constructor() {
        this._eventList = new Map<string, Array<mEvent>>();
    }
    /**
     * 自定义一个事件监听
     * @param eventName 事件名称
     * @param callback 事件回调
     * @param target 监听对象
     * @returns 
     */
    public on(eventName: string, callback: Function, target: any) {
        // 获取事件监听集合
        let array: Array<mEvent> = this._eventList.get(eventName);
        if (!array) {
            array = new Array<mEvent>();
        } else {
            // 检查队列中是否存在相同监听
            for (let i = 0; i < array.length; i++) {
                const element = array[i];
                if (element.callback === callback && element.target === target) {
                    console.log(TAG, '已存在相同的监听事件');
                    return;
                }
            }
        }
        // 添加一个事件到派送队列
        const data = new mEvent();
        data.name = eventName;
        data.callback = callback;
        data.target = target;
        array.push(data);
        this._eventList.set(eventName, array);
    }
    /**
     * 取消一个事件的监听
     * @param eventName 事件名称
     * @param callback 事件回调
     * @param target 监听对象
     * @returns void
     */
    public off(eventName: string, callback: Function, target: any) {
        let array: Array<mEvent> = this._eventList.get(eventName);
        if (!array) {
            console.log(TAG, '事件队列为空');
            return;
        } else {
            for (let i = array.length - 1; i >= 0; i--) {
                const element = array[i];
                if (element.callback === callback && element.target === target) {
                    array.splice(i, 1);
                    console.log('release event:' + eventName);
                }
            }
        }
    }
    /**
     * 派送指定事件
     * @param eventName 事件名称
     * @param args 事件派送时传递的参数
     */
    public emit(eventName: string, ...args: any) {
        let array: Array<mEvent> = this._eventList.get(eventName);
        if (!array) {
            console.log(TAG, `没有相关监听事件:${eventName}`);
            return;
        } else {
            for (let i = array.length - 1; i >= 0; i--) {
                const element = array[i];
                if (element.callback && element.target) {
                    element.callback.apply(element.target, args);
                }
            }
        }
    }
}
/** 输出一个事件管理器 */
export const mEMgr = mEventMgr.getInstance();
