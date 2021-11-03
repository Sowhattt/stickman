import { audioName } from "./audioNameMgr";
import dontDestroy from "./dontDestroy";
import audioManager from "./main/audioManager";
import { data } from "./sdk/data";
(function(){
    var Super = function(){};
    Super.prototype = cc.Button.prototype;
    //实例化原型
    Super.prototype._onTouchBegan = function (event) {
        if (this.interactable && this.enabledInHierarchy) {
            let target:cc.Node=event.target;
            if(target.getComponent(cc.Button).clickEvents[0].customEventData!="offsound"){
                audioManager.playAudio(audioName.button,false,0.6);
            }
            if (this._pressed) {
                cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                this.node.emit("click", this);
            }
            this._pressed = true;
            this._updateState();
            event.stopPropagation();
        }
    };
})();
export namespace caijiTools {
    /**
     * 加载音频资源
     * @param path resource下路径
    */
    export async function loadAudioClip(path: string) {
        let res = await caijiTools.loadResources<cc.AudioClip>(path, cc.AudioClip);
        return res;
    }
    /**
     * 加载分包中音频
     * @param bundleName 分包名
     * @param path 分包下路径
     * @returns 
     */
    export async function loadAudioClipBundle(bundleName: string, path: string) {
        let res = await caijiTools.loadBundleRes<cc.AudioClip>(bundleName, path, cc.AudioClip);
        return res;
    }
    export async function loadSkeleton(path: string) {
        let res = await caijiTools.loadResources<sp.SkeletonData>(path, sp.SkeletonData);
        return res;
    }
    /**
     * 加载图片资源
     * @param path resource下路径
     */
    export async function loadSpriteFrame(path: string) {
        let res = await caijiTools.loadResources<cc.SpriteFrame>(path, cc.SpriteFrame);
        return res;
    }
    /**
     * 加载分包中图片
     * @param bundleName 分包名
     * @param path 分包下路径
     * @returns 
     */
    export async function loadSpriteFrameBundle(bundleName: string, path: string) {
        let res = await caijiTools.loadBundleRes<cc.SpriteFrame>(bundleName, path, cc.SpriteFrame);
        return res;
    }
    /**
     * 加载texture2d资源
     * @param path 远程链接
     */
    export async function loadUrlTxture(path: string) {
        let res = await caijiTools.loadUrlResources<cc.Texture2D>(path, cc.Texture2D);
        return res;
    }
    /**
     * 加载预制体资源
     * @param path resource下路径
    */
    export async function loadPrefab(path: string) {
        let res = await caijiTools.loadResources<cc.Prefab>(path, cc.Prefab);
        return res;
    }
    export function loadResources<T>(path: string, type): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.resources.load(path, type, function (err, res: typeof type) {
                if (err) {
                    console.log("加载资源失败！" + path);
                    resolve(null);
                    return;
                }
                resolve(res);
            });
        })
    }
    /**
     * 加载分包资源
     * @param bundleName 分包名
     * @param path 分包下路径
     * @param type 文件类型
     * @returns 
     */
    export function loadBundleRes<T>(bundleName: string, path: string, type): Promise<T> {
        return new Promise((resolve, reject) => {
            let bundle = cc.assetManager.getBundle(bundleName);
            if (!bundle) {
                cc.assetManager.loadBundle(bundleName, (err, b) => {
                    if (!err) {
                        bundle = b;
                        bundle.load(path, type, (err, res: typeof type) => {
                            resolve(res);
                        });
                    }
                });
            } else {
                bundle.load(path, type, (err, res: typeof type) => {
                    resolve(res);
                });
            }
        });

    }
    /**
     * 加载分包
     * @param bundleName 分包名
     */
    export function loadBundlePackage(bundleName:string,callBack:Function){
        cc.assetManager.loadBundle(bundleName, (err, bundle) => {
            if (err) {
                console.log(err);
            }else{
                callBack(bundleName);
            }
        });
    }
    export function loadUrlResources<T>(path: string, type): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadRemote(path, type, function (err, res: typeof type) {
                if (err) {
                    console.log("加载url资源失败！" + path);
                    return;
                }
                resolve(res);
            });
        })
    }
    export function addCoin(addNum: number, coinLabel: cc.Label = null, coinNode: cc.Node = null) {
        let nowCoin = Number(data.getCache("Base", "coin"));
        let obj = { a: nowCoin };
        nowCoin += addNum;
        data.updateCache("Base", "coin", nowCoin);
        caijiTools.showGetCoinTip(addNum);
        if (coinLabel != null) {
            coinLabel.unscheduleAllCallbacks();
            //@ts-ignore
            cc.tween(obj)
                .to(1, { a: nowCoin }, {
                    progress: (start: number, end: number, current: any, t: number) => {
                        //start:起始值 end:终点值 current:当前值 t:总时占比0~1 
                        //返回值为最终赋值
                        let now = cc.misc.lerp(start, end, t);
                        coinLabel.string = now.toFixed(0);
                        return now;
                    }, easing: "cubicOut"
                })
                .start();
        }
        if (coinNode == null) return;
        cc.resources.load("prefab/addLable", cc.Prefab, function (err, Prefab: cc.Prefab) {
            let addLable = cc.instantiate(Prefab);
            addLable.setParent(coinNode);
            addLable.setPosition(cc.v2(coinNode.width / 2, -coinNode.height / 2));
            addLable.getComponent(cc.Label).string = addNum > 0 ? ("+" + addNum) : addNum.toString();
            addLable.active = true;
            cc.tween(addLable)
                .to(0.1, { scale: 0.8 })
                .by(0.5, { position: cc.v3(0, 70), opacity: -255 })
                .call(() => {
                    addLable.destroy();
                })
                .start();
        });
    }
    export async function showGetCoinTip(addNum: number) {
        let prefab = await caijiTools.loadPrefab("prefabs/ui/getCoinTip");
        if (!prefab) return;
        let node = caijiTools.createNode(prefab, cc.find("Canvas"));
        node.getComponent("getCoinTip").addNum = addNum;
        node.setPosition(0, cc.winSize.height / 2 * 0.2);
        node.active = true;
    }
    export async function showGetPowerTip(addNum: number) {
        let prefab = await caijiTools.loadPrefab("prefabs/ui/getPowerTip");
        if (!prefab) return;
        let node = caijiTools.createNode(prefab, cc.find("Canvas"));
        node.getComponent("getPowerTip").addNum = addNum;
        node.setPosition(0, cc.winSize.height / 2 * 0.2);
        node.active = true;
    }
    export function addPower(addNum: number, powerLabel: cc.Label = null) {
        let nowPower = Number(data.getCache("Base", "power"));
        let obj = { a: nowPower };
        nowPower += addNum;
        data.updateCache("Base", "power", nowPower);
        dontDestroy.instance.checkPowerIsFull();
        caijiTools.showGetPowerTip(addNum);
        if (powerLabel != null) {
            powerLabel.unscheduleAllCallbacks();
            //@ts-ignore
            cc.tween(obj)
                .to(0.5, { a: nowPower }, {
                    progress: (start: number, end: number, current: any, t: number) => {
                        //start:起始值 end:终点值 current:当前值 t:总时占比0~1 
                        //返回值为最终赋值
                        let now = cc.misc.lerp(start, end, t);
                        powerLabel.string = now.toFixed(0);
                        return now;
                    }, easing: "cubicOut"
                })
                .start();
        }
    }
    export function isCoinEnough(number: number) {
        return Number(data.getCache("Base", "coin")) >= number;
    }
    export function isPowerEnough(number: number) {
        return Number(data.getCache("Base", "power")) >= number;
    }
    /**
     * 展示解锁皮肤弹窗 
     * @param skinIndex 下标从0开始
     * @param uiName 获得皮肤弹窗ui名
     */
    export async function showUnlockSkin(skinIndex: number, uiName: string) {
        data.updateCache("Base", "inUsingSkin", skinIndex);
        data.updateCache("skins", skinIndex.toString(), 1);
        let prefab = await caijiTools.loadPrefab("prefabs/ui/" + uiName);
        let ndoe = caijiTools.createNode(prefab, cc.find("Canvas"), true);
        ndoe.getComponent(uiName).skinIndex = skinIndex;
    }
    /**
    * 弹窗
    * @param uiName 弹窗ui名
    */
    export async function showPopup(uiName: string, parent: cc.Node,isShow=true,zIndexMax: boolean = false) {
        let prefab = await caijiTools.loadPrefab("prefabs/ui/" + uiName);
        if(prefab)
        return caijiTools.createNode(prefab, parent, isShow,zIndexMax);
    }
    export function createNode(prefab: cc.Prefab, parent: cc.Node,isShow:boolean=true,zIndexMax: boolean = false) {
        let newNode: cc.Node = cc.instantiate(prefab);
        newNode.setParent(parent);
        newNode.setPosition(0, 0);
        if (zIndexMax) {
            newNode.zIndex = cc.macro.MAX_ZINDEX;
        }
        newNode.active = isShow;
        return newNode;
    }
    export function updatePowerTimer(powerLabel: cc.Label, powerTimerLabel: cc.Label,maxPower:number) {
        let nowPower = data.getCache<string>("Base", "power");
        powerLabel.string = nowPower;
        if (dontDestroy.instance.isTimer && powerTimerLabel.node.active == false) {
            powerTimerLabel.node.active = true;
        } else if (dontDestroy.instance.isTimer == false && powerTimerLabel.node.active == true) {
            powerTimerLabel.node.active = false;
        }
        if(Number(nowPower)>=maxPower) return;
        if (dontDestroy.instance.sec >= 10) {
            powerTimerLabel.string = "0" + dontDestroy.instance.min + ":" + dontDestroy.instance.sec;
        } else {
            powerTimerLabel.string = "0" + dontDestroy.instance.min + ":" + "0" + dontDestroy.instance.sec ;
        }
    }
    /**
     * 抖动相机
     * @param cameraNode 相机节点
     * @param repeat 重复次数
     * @param offsetX x偏移量
     * @param offsetY y偏移量
     */
    export function screenShake(cameraNode: cc.Node, repeat: number = 6, offsetX: number = 5, offsetY: number = 10) {
        let times=0;
        let nowX=offsetX;
        let nowY=offsetY;
        let tween=(ox,oy)=>{
            times++;
            cc.tween(cameraNode)
            .by(0.03, { y:oy })
            .by(0.03, { y:-oy })
            .call(()=>{
                if(times<repeat){
                    nowX=nowX-offsetX/repeat;
                    nowY=nowY-offsetY/repeat;
                    tween(nowX,nowY);
                }
            })
            .start()
        }
        tween(nowX,nowY);
    }
    /**
     * 改变build相机的y轴坐标使其建筑一直保持在最底部
     * @param camera 目标相机
     */
    export function changeBulidCamera_posY(camera: cc.Camera) {
        let Y = (1 / camera.zoomRatio - 1) * cc.winSize.height / 2;
        camera.node.y = Y;
    }

    /**
     * 获取两向量的夹角
     * @param vec1 向量1
     * @param vec2 向量2
     */
    export function getAngleBetweenTwoVec(vec1: cc.Vec2, vec2: cc.Vec2) {
        return vec1.normalize().signAngle(vec2.normalize()) * 180 / Math.PI;
    }
    /**
     * 获取方向角度（以y轴正方向为基准顺时针旋转180°为正，逆时针180°为负）
     * @param x 
     * @param y 
     */
    export function getAngleDependY(x, y) {
        let rad = Math.atan2(x, y); // 反正切函数，得到弧度
        let angle = 180 * rad / Math.PI;    // 将弧度rad转换为角度
        return angle;
    }
    //cc.misc.degreesToRadians(deg) // 角度转弧度
    //cc.misc.radiansToDegrees(rad)  // 弧度转角度
    /**
     * 获取角度方向向量
     * @param angle 角度
     */
    export function getDirection(angle) {
        let x = Math.sin(-angle * Math.PI / 180);
        let y = Math.cos(-angle * Math.PI / 180);
        return cc.v2(x, y);
    }
    /**
     * 获取贝塞尔曲线轨迹点
     * @param startPos 起点
     * @param controlPos 控制点
     * @param endPos 终点
     * @param posCount  取点数量
     */
    export function getBezierPositions(startPos, controlPos, endPos, posCount) {
        let result = new Array();
        for (var i = 0; i < posCount; i++) {
            result[i] = cc.v2();
        }
        for (let i = 0; i < posCount; i++) {
            let t = i / posCount;
            result[i].x = 1 * Math.pow(1 - t, 2) * Math.pow(t, 0) * startPos.x
                + 2 * Math.pow(1 - t, 1) * Math.pow(t, 1) * controlPos.x
                + 1 * Math.pow(1 - t, 0) * Math.pow(t, 2) * endPos.x;
            result[i].y = 1 * Math.pow(1 - t, 2) * Math.pow(t, 0) * startPos.y
                + 2 * Math.pow(1 - t, 1) * Math.pow(t, 1) * controlPos.y
                + 1 * Math.pow(1 - t, 0) * Math.pow(t, 2) * endPos.y;
        }
        return result;
    }
    /**
    * 截屏
    * @param camera 渲染摄像机
    * @param showTexture 渲染到目标节点（带sprite组件）
     */
    export function cutPicture(camera: cc.Camera, showTexture: cc.Node, size: cc.Size = null) {
        const w: number = size != null ? size.width : cc.winSize.width;
        const h: number = size != null ? size.height : cc.winSize.height;

        let rendTexture: cc.RenderTexture = new cc.RenderTexture();
        //@ts-ignore
        let gl = cc.game._renderContext;
        //@ts-ignore
        rendTexture.initWithSize(w, h, gl.STENCIL_INDEX8);

        //camera.cullingMask = 0xffffffff;
        camera.targetTexture = rendTexture;
        //@ts-ignore
        camera.render();

        // 指定需要读取的区域的像素
        let pixels = new Uint8Array(w * h * 4);
        let data = rendTexture.readPixels(pixels);
        let _width = rendTexture.width;
        let _height = rendTexture.height;
        let picData = caijiTools.filpYImage(data, _width, _height);

        let texture2d: cc.Texture2D = new cc.Texture2D();
        //@ts-ignore
        texture2d.initWithData(picData, cc.Texture2D.RGBA8888, _width, _height);

        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture2d);

        showTexture.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        showTexture.setContentSize(cc.size(w, h));
        camera.targetTexture = null;
        /*         console.log("size==="+showTexture.getContentSize());
                console.log("pos==="+showTexture.position.toString()); */
    }
    /**
     * 截取指定高度的图
     * @param camera 渲染相机
     * @param showTexture 渲染至目标节点
     * @param startY y轴开始坐标（屏幕坐标）
     * @param cutHeight 截取高度
     */
    export function cutPicture_height(camera: cc.Camera, showTexture: cc.Node, startY: number, cutHeight: number) {
        const w: number = cc.winSize.width;
        const h: number = cc.winSize.height;

        let rendTexture: cc.RenderTexture = new cc.RenderTexture();
        //@ts-ignore
        let gl = cc.game._renderContext;
        //@ts-ignore
        rendTexture.initWithSize(w, h, gl.STENCIL_INDEX8);

        //camera.cullingMask = 0xffffffff;
        camera.targetTexture = rendTexture;
        //@ts-ignore
        camera.render();

        // 指定需要读取的区域的像素
        let pixels = new Uint8Array(w * h * 4);
        let x = 0;
        let y = startY;       //（x,y）为开始截取的屏幕坐标点
        let Pixels_y = cutHeight;  //截取高度
        let data = rendTexture.readPixels(pixels, x, y, w, Pixels_y);//readPixels();
        let _width = rendTexture.width;
        let picData = this.filpYImage(data, _width, Pixels_y);

        let texture2d: cc.Texture2D = new cc.Texture2D();
        //@ts-ignore
        texture2d.initWithData(picData, cc.Texture2D.RGBA8888, _width, Pixels_y);

        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture2d);

        showTexture.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        showTexture.setContentSize(cc.size(w, Pixels_y));
    }
    export function filpYImage(data, width, height) {
        // create the data array
        let picData = new Uint8Array(width * height * 4);
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let start = srow * width * 4;
            let reStart = row * width * 4;
            // save the piexls data
            for (let i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i];
            }
        }
        return picData;
    }
    /**
     * 将相机渲染到节点
     * @param sprite 目标精灵组件
     * @param camera 渲染相机
     */
     export function setCameraTexture(sprite: cc.Sprite, camera: cc.Camera) {
        let texture = new cc.RenderTexture();
        texture.initWithSize(sprite.node.width, sprite.node.height);
        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        camera.targetTexture = texture;
        sprite.spriteFrame = spriteFrame;
    }
    export function playSkeletonAnimation(skeleton: sp.Skeleton, animationName: string, timeScale, isLoop: boolean = false) {
        if (animationName == skeleton.animation) {
            return;
        }
        skeleton.setAnimation(0, animationName, isLoop);
        skeleton.timeScale = timeScale;
    }
    /**
     * graphics画线
     * @param wordlPos 世界坐标点集
     * @param graphics graphics组件
     */
    export function drawGraphics(wordlPos: cc.Vec2[], graphics: cc.Graphics) {
        for (let i = 0; i < wordlPos.length; i++) {
            let nodePos = graphics.node.convertToNodeSpaceAR(wordlPos[i]);
            if (i == 0) {
                graphics.moveTo(nodePos.x, nodePos.y);
            } else {
                graphics.lineTo(nodePos.x, nodePos.y);
            }
            graphics.stroke();
        }
    }
    /**
     * 依次加载指定的游戏子包(子节跳动)
     * @param name 子包别名集合
    */
     export function loadSubPackge(name: string[]) {
        let loadFunc: Function = function (name: string) {
            return new Promise((resolve, reject) => {
                //@ts-ignore
                tt.loadSubpackage({
                    name: name, // name 可以填 name 或者 root
                    success: function (res) {
                        cc.assetManager.loadBundle(name, (err, bundle) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(name + "加载完成")
                        });
                    },
                    fail: function (res) {
                        reject(res);
                    }
                });
            });
        }
        let promises: Promise<string>[] = [];
        name.forEach(root => {
            promises.push(loadFunc(root));
        });
        return Promise.all(promises);
    }
    /**
    * 动态绑定Button点击事件
    * @param node         脚本所在节点
    * @param script_name  脚本文件名
    * @param method       指向脚本文件中的方法 
    * @param btnNode      button组件所在节点
    * @param data         传递的参数 
    */
    export function BindButtonClickListener(node: cc.Node, script_name: string, method: string, btnNode: cc.Node, data: string = ""): void {
        var clickEventHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = node;
        clickEventHandler.component = script_name;
        clickEventHandler.handler = method;
        if (data != "") {
            clickEventHandler.customEventData = data;
        }
        var button: cc.Button = btnNode.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    }
    export function openPhysicsSystem(isShowDebugPhy:Number=1,isShowDebugCollider:boolean=false){
        let physicsManager=cc.director.getPhysicsManager();
        let colliderManager=cc.director.getCollisionManager();
        physicsManager.enabled=true;
        colliderManager.enabled=true;
        colliderManager.enabledDebugDraw=isShowDebugCollider==false?false:true;
        physicsManager.debugDrawFlags=isShowDebugPhy==1?1:0;
    }
    /**
     * 随机整数
     * @param min 最小值
     * @param max 最大值
     * @returns 
     */
    export function random_int(min, max): number {  
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
