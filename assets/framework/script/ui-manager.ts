import UIBase from "./ui-base";
const TAG = 'ui-manager.ts';
const UIROOT_ZINDEX = 999;
const UIROOT_NAME = 'ui-root';
const DEFAULT_CANVAS = 'ui-default-node';
interface uiConfig {
    /** 
    预制体文件位置 */
    file_url: string;
    /**
    所属资源包*/
    bundle: string;
    /**
    所属画布节点*/
    canvas: string;
}
class UIMap {
    /** 
    预制体 */
    prefab: cc.Prefab;
    /** 
    UI对象 */
    ui: UIBase;
    /**
    UI配置信息*/
    config: uiConfig;
    /** 
    预加载 */
    preload?: boolean;
    /**
    是否依赖场景*/
    relyon_scnene?: boolean
}
class uiManager {
    /** 
    UI 根节点 */
    private _uiRoot: cc.Node = null;
    /**
    UI 配置表 Map */
    private _uiConfigMap: Map<string, uiConfig> = null;
    /** 
    UI 配置信息 Map */
    private _uiMap: Map<string, UIMap> = null;
    /**
    UI 画布节点 Map*/
    private _canvasMap: Map<string, cc.Node> = null;
    /** 
    构造函数 */
    constructor() {
        this._uiConfigMap = new Map<string, uiConfig>();
        this._uiMap = new Map<string, UIMap>();
        this._canvasMap = new Map<string, cc.Node>();
    }
    /**
     * 获取UI配置信息
     * @param uiname 
     */
    private async _getMUI(uiname: string) {
        let mui: UIMap = this._uiMap.get(uiname);
        if (!mui) {
            let config = await this.getConfig(uiname);
            if (config) {
                let prefab = await loadPrefab(config.file_url, config.bundle);
                mui = new UIMap();
                mui.prefab = prefab;
                mui.config = config;
                mui.ui = null;
                prefab.addRef();
                this._uiMap.set(uiname, mui);
            } else {
                cc.warn(TAG, `not find ${uiname} in file: ui-config`);
            }
        }
        return mui;
    }
    /**
     * 获得UI根节点
     * @returns cc.Node
     */
    private getUIRoot() {
        if (!this._uiRoot) {
            this._uiRoot = new cc.Node(UIROOT_NAME);
            cc.director.getScene().addChild(this._uiRoot, UIROOT_ZINDEX);
            cc.game.addPersistRootNode(this._uiRoot);
            this._uiRoot.setAnchorPoint(cc.v2(0, 0));
            this._uiRoot.setPosition(cc.v2(0, 0));
            this._uiRoot.setContentSize(cc.winSize);
        }
        return this._uiRoot;
    }
    /**
     * 构建一个UI画布节点
     * @param cname 画布节点名称
     * @returns cc.Node
     */
    private _getCanvas(cname: string = DEFAULT_CANVAS) {
        if (!cname) {
            cname = DEFAULT_CANVAS;
        }
        let canvas: cc.Node = this._canvasMap.get(cname);
        if (!canvas) {
            canvas = new cc.Node(cname);
            this.getUIRoot().addChild(canvas);
            canvas.setAnchorPoint(cc.v2(0, 0));
            let widget = canvas.addComponent(cc.Widget);
            widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;
            this._canvasMap.set(cname, canvas);
        }
        return canvas;
    }
    /**
     * 构建一个UI
     * @param uiname UI名称
     * @param mui UI配置信息
     * @param rootNode 自定义根节点
     * @param create 是否创建
     * @returns UIBase
     */
    private async _getUI(uiname: string, mui: UIMap, rootNode: cc.Node, create: boolean = false) {
        let ui = mui.ui;
        if (!ui && create) {
            let node = cc.instantiate(mui.prefab);
            let canvas = rootNode ? rootNode : this._getCanvas(mui.config.canvas);
            canvas.addChild(node);
            node.active = false;
            node.setPosition(rootNode ? cc.v2(0, 0) : cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
            ui = node.getComponent(UIBase) || node.getComponentInChildren(UIBase);
            if (!ui) {
                ui = node.addComponent(UIBase);
            }
            ui._setRootNode(node);
            ui._setCanvas(canvas);
            ui._setUIName(uiname);
            await ui.onUICreate();
            mui.ui = ui;
            this._uiMap.set(uiname, mui);
        }
        return ui;
    }
    /**
     * 打开指定UI
     * @param uiname UI名称
     * @param rootNode 根节点
     * @param preload 预加载
     * @param args 启动参数
     * @returns Promise<UIBase>
     */
    async openUI(uiname: string, rootNode: cc.Node = null, preload: boolean = false, ...args: any[]) {
        return new Promise<UIBase>(async (resolve) => {
            let ui: UIBase = null;
            let mui: UIMap = await this._getMUI(uiname);
            if (mui) {
                ui = mui.ui;
                mui.preload = preload;
                if (!ui) {
                    ui = await this._getUI(uiname, mui, rootNode, true);
                    mui.relyon_scnene = rootNode ? true : false;
                }
                if (ui && !preload) {
                    ui._setActive(true);
                    ui.onUILaunch(...args);
                }
            }
            resolve(ui);
        });
    }
    /**
     * 关闭指定UI
     * @param uiname UI名称
     * @param release 释放对象
     */
    closeUI(uiname: string, release: boolean = false) {
        let mui: UIMap = this._uiMap.get(uiname);
        if (mui) {
            let ui = mui.ui;
            if (ui) {
                ui.onUIClose();
                ui._setActive(false);
            }
            if (release) {
                console.log('release: ' + uiname);
                this.releaseUI(uiname);
            }
        }
    }
    /**
     * 设置UI索引,UI不会被关闭释放
     * @param uiname 
     * @param z_index
     */
    setUIzIndex(uiname: string, z_index: number = 0) {
        let mui: UIMap = this._uiMap.get(uiname);
        if (mui) {
            let ui = mui.ui;
            if (ui) {
                ui._setSiblingIndex(z_index);
                ui.onIndexChange(z_index);
            }
        }
    }
    /**
     * 释放指定UI
     * @param uiname 
     */
    releaseUI(uiname: string) {
        let mui: UIMap = this._uiMap.get(uiname);
        if (mui) {
            let ui = mui.ui;
            if (ui) {
                ui.onUIRelease();
                ui.node.destroy();
                mui.prefab.decRef();
                mui.prefab = null;
                mui.ui = null;
                mui.config = null;
                this._uiMap.delete(uiname);
            }
        }
    }
    /**
     * 自动释放依赖场景的UI
     */
    autoRelease() {
        let delete_keys: string[] = [];
        this._uiMap.forEach((mui: UIMap, key: string) => {
            if (mui.relyon_scnene) {
                delete_keys.push(key);
            }
        });
        if (delete_keys.length > 0) {
            for (let i = 0; i < delete_keys.length; i++) {
                console.log('auto release: ' + delete_keys[i]);
                this.releaseUI(delete_keys[i]);
            }
        }
    }
    /**
     * 获取UI配置表单
     * @param uiname 
     */
    private getConfig(uiname: string) {
        return new Promise<uiConfig>((resolve) => {
            let uiconf = this._uiConfigMap.get(uiname);
            if (uiconf) {
                resolve(uiconf);
            } else {
                cc.resources.load('json/ui-config', cc.JsonAsset, (err, asset: cc.JsonAsset) => {
                    if (!err && asset) {
                        this._uiConfigMap.set(uiname, asset.json.ui[uiname]);
                        resolve(this._uiConfigMap.get(uiname));
                    } else {
                        cc.warn(TAG, `not find ui-config in ${cc.resources.name}`);
                        resolve(null);
                    }
                });
            }
        });
    }
}
/**
* 加载预制体
* @param url 
* @param bundle 
* @returns Promise<cc.Prefab>
*/
function loadPrefab(url: string, bundle?: string) {
    return new Promise<cc.Prefab>((resolve) => {
        if (bundle) {
            let asset_bundle = cc.assetManager.getBundle(bundle);
            if (asset_bundle) {
                asset_bundle.load(url, cc.Prefab, (err, prefab: cc.Prefab) => {
                    if (!err && prefab) {
                        resolve(prefab);
                    } else {
                        resolve(null);
                        cc.warn(TAG, `not find ${url} in ${bundle}`);
                    }
                });
            } else {
                cc.assetManager.loadBundle(bundle, (err, _bundle) => {
                    if (!err && _bundle) {
                        _bundle.load(url, cc.Prefab, (err, prefab: cc.Prefab) => {
                            if (!err && prefab) {
                                resolve(prefab);
                            } else {
                                resolve(null);
                                cc.warn(TAG, `not find ${url} in ${bundle}`);
                            }
                        });
                    } else {
                        cc.warn(TAG, `not find bundle ${bundle}`);
                    }
                });
            }
        } else {
            cc.resources.load(url, cc.Prefab, (err, prefab: cc.Prefab) => {
                if (!err && prefab) {
                    resolve(prefab);
                } else {
                    resolve(null);
                    console.log(TAG, `not find ${url} in ${cc.resources.name}`);
                }
            });
        }
    });
}
export const uiMgr = new uiManager();
