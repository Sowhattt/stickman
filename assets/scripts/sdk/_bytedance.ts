import { param } from "./type";
const TAG = '_bytedance.ts';
class _bytedance {
    private static Instance: _bytedance;
    private recordTimeStamp: number = 0;
    private videoPath: string = "";
    private recordTimeLength: number = 0;
    private appIdParam: string = "";
    private bannerAdParam: string = "";
    private vedioAdParam: string = "";
    private insertAdParam: string = "";
    private shareRecordDesc: string[] = [];
    private bannerAd: any = null;
    private videoAd: any = null;
    private bannerBox: any = null;
    private OnVideoCallBackListener: Function = null;
    private sdkInitEnd: boolean = false;
    private insertAdTime: number = 0;
    private recordManager: any = null;
    private show_start: boolean = false;
    private show_end: boolean = false;
    private userQuery: string = '';
    private constructor() {
        console.log(TAG, 'init platform channel: bytedance');
    }
    public static getInstance(): _bytedance {
        if (this.Instance == null) {
            this.Instance = new _bytedance();
        }
        return this.Instance;
    }
    initRecordListener() {
        let that: _bytedance = this;
        //@ts-ignore
        this.recordManager = tt.getGameRecorderManager();
        this.recordManager.onStart(() => {
            that.videoPath = "";
            that.recordTimeStamp = Math.floor(new Date().getTime());
            that.showToast(that.show_start, '录制开始', 'success', 800);
        });
        this.recordManager.onError((err: any) => {
            console.warn(TAG, '录屏失败:', err['errMsg']);
        });
        this.recordManager.onStop((res: any) => {
            that.recordTimeLength = Math.floor(new Date().getTime()) - that.recordTimeStamp;
            if (that.recordTimeLength >= 3000) {
                that.videoPath = res['videoPath'];
                that.showToast(that.show_end, '录制完成', 'success', 1000);
            }
        });
    }
    luzhiVideo_start(startTip: boolean = false, maxSecond: number = 300, isMarkOpen: boolean = false) {
        this.show_start = startTip;
        this.recordManager.start({ duration: maxSecond, isMarkOpen: isMarkOpen });
    }
    luzhiVideo_stop(endTip: boolean = true) {
        this.show_end = endTip;
        this.recordManager.stop();
    }
    luzhiVideo_share(onShareCall: Function, query: string = 'k1=v1&k2=v2') {
        if (onShareCall == null || this.videoPath == null || this.recordTimeLength < 3000) {
            if (onShareCall == null) {
                console.warn(TAG, '分享回调为null!');
            }
            else if (this.videoPath == null) {
                console.warn(TAG, '不存在未分发的视频!');
            }
            else {
                console.warn(TAG, '录制时间小于3秒!');
            }
            return;
        }
        this.userQuery = query;
        this.video_share(onShareCall, this.userQuery);
    }
    video_share(OnShareCall: Function, query: string = 'k1=v1&k2=v2') {
        let that: _bytedance = this;
        // @ts-ignore
        tt.shareAppMessage({
            channel: "video",
            query: query,
            extra: {
                videoPath: that.videoPath,
                video_title: that.shareRecordDesc[1],     // 生成输入的默认文案
                videoTopics: [that.shareRecordDesc[0]],   // 视频话题(仅抖音支持)
                hashtag_list: [that.shareRecordDesc[0]],  // 视频话题(仅抖音支持)
                withVideoId: false,  // 是否支持跳转到播放页， 以及支持获取视频信息等接口 （为 true 时会在 success 回调中带上 videoId）
                videoTag: ''         // 分享视频的标签，可以结合获取抖音视频排行榜使用
            },
            success(res: any) {
                OnShareCall(true);
                that.videoPath = "";
                that.recordTimeLength = 0;
                that.showToast(true, '分享成功', 'success', 1000);
            },
            fail(e: any) {
                console.warn(TAG, `分享失败:${JSON.stringify(e)}`);
                OnShareCall(false);
                that.showToast(true, '分享失败', 'fail', 1000);
            }
        });
    }
    getVideoInfo(id: string) {
        //@ts-ignore
        tt.request({
            url: "https://gate.snssdk.com/developer/api/get_video_info",
            method: "POST",
            data: {
                alias_ids: [id],
            },
            success: (res: any) => {
                if (res.data.data[0].video_info.cover_url) {
                    console.log(res.data.data[0].video_info); // 包含 cover_url，还有其它字段
                } else {
                    //服务端存在延迟如果获取失败则5秒后再次获取
                    setTimeout(() => {
                        this.getVideoInfo(id);
                    }, 5000);
                }
            },
        });
    }
    /**
     * 消息提示框
     * @param show 是否弹出提示框
     * @param message 提示信息
     * @param icon (success,loading,none,fail)成功,加载,不显示图标,失败
     * @param duration 持续时间
     */
    showToast(show: boolean = false, message: string, icon: string = 'none', duration: number = 1000) {
        if (!show) {
            return;
        }
        //@ts-ignore
        tt.showToast({
            title: message,
            icon: icon,
            duration: duration,
        });
    }
    buttonShare(OnShareCall: Function) {
        // @ts-ignore
        tt.shareAppMessage({
            success() {
                OnShareCall(true);
                console.log(TAG, '分享成功!');
            },
            fail(e: Object) {
                OnShareCall(false);
                console.warn(TAG, `分享失败:${JSON.stringify(e)}`);
            }
        });
    }
    shakeDevice() {
        // @ts-ignore
        tt.vibrateShort({
            fail(res: Object) {
                console.warn(TAG, `震动失败:${res}`);
            }
        });
    }
    shakeDeviceLong() {
        // @ts-ignore
        tt.vibrateLong({
            fail(res: Object) {
                console.warn(TAG, `震动失败:${res}`);
            }
        });
    }
    showTTGameIcon(): boolean {
        //@ts-ignore
        const systemInfo = tt.getSystemInfoSync();
        if (systemInfo.platform === "ios") {
            return false;
        }
        let appName: string[] = ['Douyin', 'Toutiao', 'news_article_lite'];
        return appName.indexOf(systemInfo.appName) === -1 ? false : true;
    }
    openMoreGame() {
        //@ts-ignore
        tt.onMoreGamesModalClose(function () {
            console.warn(TAG, "modal closed!");
        });
        //@ts-ignore
        tt.onNavigateToMiniProgram(function (res) {
            console.log(res.errCode);
            console.log(res.errMsg);
        });
        //@ts-ignore
        const systemInfo = tt.getSystemInfoSync();
        // iOS 不支持，建议先检测再使用
        if (systemInfo.platform !== "ios") {
            //@ts-ignore
            tt.showMoreGamesModal({
                appLaunchOptions: [
                    {
                        appId: this.appIdParam,
                        query: "foo=bar&baz=qux",
                        extraData: {}
                    }
                    // {...}
                ],
                success() {
                    console.log(TAG, `success`);
                },
                fail(res: any) {
                    console.log(TAG, `${JSON.stringify(res)}`);
                }
            });
        }
    }
    initAdParams(param: param) {
        if (this.sdkInitEnd) {
            return;
        }
        this.sdkInitEnd = true;
        this.initRecordListener();
        this.appIdParam = param.appId;
        this.insertAdParam = param.insertId;
        this.bannerAdParam = param.bannerId;
        this.vedioAdParam = param.videoId;
        this.shareRecordDesc = param.shareDesc;
        try {
            this.initBannerAd();
        } catch (error) {
            console.warn(TAG, `Init ad params:${error}`);
        }
    }
    initGameBanner() {
        //@ts-ignore
        const { windowWidth, windowHeight } = tt.getSystemInfoSync();
        var bannerBoxWidth = windowWidth;
        //@ts-ignore
        this.bannerBox = tt.createMoreGamesBanner({
            style: {
                width: bannerBoxWidth,
                verticalAlign: 'bottom',
                horizontalAlign: 'center'
            },
            appLaunchOptions: [
                {
                    appId: this.appIdParam,
                    query: "foo=bar&baz=qux",
                    extraData: {}
                }
                // {...}
            ],
        })
        this.bannerBox.show();
        this.bannerBox.onTap(() => {
            console.log(TAG, `点击跳转游戏盒子`);
        });
    }
    gameBanner_show() {
        if (this.bannerBox) {
            this.bannerBox.show();
        } else {
            this.initGameBanner();
        }
    }
    gameBanner_hide() {
        if (this.bannerBox) {
            this.bannerBox.hide();
        }
    }
    initBannerAd() {
        // @ts-ignore
        const { windowWidth, windowHeight } = tt.getSystemInfoSync();
        var targetBannerAdWidth = 120;
        // 创建一个居于屏幕底部正中的广告
        // @ts-ignore
        this.bannerAd = tt.createBannerAd({
            adUnitId: this.bannerAdParam,
            style: {
                width: targetBannerAdWidth,
                top: windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
            }
        });
        this.bannerAd.onError((err: any) => {
            switch (err['errCode']) {
                case 1000:
                    console.warn(TAG, '后端错误调用失败');
                    break;
                case 1001:
                    console.warn(TAG, '参数错误');
                    break;
                case 1002:
                    console.warn(TAG, '广告单元无效');
                    break;
                case 1003:
                    console.warn(TAG, '内部错误');
                    break;
                case 1004:
                    console.warn(TAG, '无合适的广告, 尝试重新加载');
                    break;
                case 1005:
                    console.warn(TAG, '广告正在被审核，无法展现广告');
                    break;
                case 1007:
                    console.warn(TAG, '广告能力被禁用');
                    break;
                case 1008:
                    console.warn(TAG, '广告单元已关闭');
                    break;
                case 120002:
                    console.warn(TAG, '广告发送的次数已达当日上限');
                    break;
                default:
                    break;
            }
        });
        // 也可以手动修改属性以调整广告尺寸
        this.bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;
        // 尺寸调整时会触发回调
        // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
        this.bannerAd.onResize((size: any) => {
            console.log(TAG, size.width, size.height);
            if (size.width == 0 || size.height == 0) {
                return;
            }
            // 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
            if (targetBannerAdWidth != size.width) {
                targetBannerAdWidth = size.width;
                this.bannerAd.style.top = windowHeight - (size.height);
                this.bannerAd.style.left = (windowWidth - size.width) / 2;
            }
        });
        //广告组件成功拉取广告素材时会触发load事件的监听器
        this.bannerAd.onLoad(function () {
            console.log(TAG, "banner广告拉取完成!");
        });
    }
    bannerAd_show() {
        if (this.bannerAd) {
            this.bannerAd.show();
        }
    }
    bannerAd_hide() {
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.initBannerAd();
        }
    }
    showLoading() {
        //@ts-ignore
        tt.showLoading({ title: "请求中，请稍后..." });
    }
    hideLoading() {
        //@ts-ignore
        tt.hideLoading({});
    }
    initVideo() {
        // @ts-ignore
        this.videoAd = tt.createRewardedVideoAd({
            adUnitId: this.vedioAdParam,
            multiton: false,
            multitonRewardedMsg: '观看下一个可领取更多奖励'
        });
        this.videoAd.onError((err: any) => {
            switch (err['errCode']) {
                case 1000:
                    console.warn(TAG, '后端错误调用失败');
                    break;
                case 1001:
                    console.warn(TAG, '参数错误');
                    break;
                case 1002:
                    console.warn(TAG, '广告单元无效');
                    break;
                case 1003:
                    console.warn(TAG, '内部错误');
                    break;
                case 1004:
                    console.warn(TAG, '无合适的广告, 尝试重新加载');
                    break;
                case 1005:
                    console.warn(TAG, '广告正在被审核，无法展现广告');
                    break;
                case 1007:
                    console.warn(TAG, '广告能力被禁用');
                    break;
                case 1008:
                    console.warn(TAG, '广告单元已关闭');
                    break;
                case 120002:
                    console.warn(TAG, '广告发送的次数已达当日上限');
                    break;
                default:
                    console.warn(TAG, `视频广告错误:https://microapp._bytedance.com/docs/zh-CN/mini-game/develop/open-capacity/ads/rewarded-video-ad/rewarded-video-ad-on-error#%E9%94%99%E8%AF%AF%E7%A0%81%E8%AF%A6%E6%83%85`);
                    break;
            }
        });
        this.videoAd.onClose((res: any) => {
            if (res['isEnded']) {
                this.OnVideoCallBackListener(true);
            } else {
                this.OnVideoCallBackListener(false);
            }
        });
        this.videoAd.onLoad((res: any) => {
            this.videoAd.show();
            this.hideLoading();
        });
        this.videoAd.load();
        this.showLoading();
    }
    videoAd_show(OnVideoCall: Function) {
        this.OnVideoCallBackListener = OnVideoCall;
        if (this.videoAd != null) {
            this.showLoading();
            this.videoAd.load();
        } else {
            this.initVideo();
        }
    }
    insterAd_show() {
        let time = new Date().getTime();
        if (time - this.insertAdTime < 35000) {
            console.log(TAG, '广告冷却中...');
            return;
        }
        this.insertAdTime = time;
        //@ts-ignore
        let interstitialAd = tt.createInterstitialAd({
            adUnitId: this.insertAdParam
        });
        interstitialAd.onError((err: any) => {
            switch (err['errCode']) {
                case 2001:
                    console.warn(TAG, '小程序启动一定时间内不允许展示插屏广告');
                    break;
                case 2002:
                    console.warn(TAG, '距离小程序插屏广告或者激励视频广告上次播放时间间隔不足，不允许展示插屏广告');
                    break;
                case 2003:
                    console.warn(TAG, '当前正在播放激励视频广告或者插屏广告，不允许再次展示插屏广告');
                    break;
                case 2004:
                    console.warn(TAG, '该项错误不是开发者的异常情况，或因小程序页面切换导致广告渲染失败');
                    break;
                case 2005:
                    console.warn(TAG, '插屏广告实例不允许跨页面调用');
                    break;
                default:
                    // 更多请参考错 误码文档 
                    break;
            }
        });
        interstitialAd.onClose(() => {
            interstitialAd.destroy();
        });
        interstitialAd.load().then(() => {
            interstitialAd.show();
        });
    }
    reportAnalytics(values: string | null, customObject: Object = {}) {
        //@ts-ignore
        tt.reportAnalytics(values, customObject);
    }
    showFavoriteGuide() {
        //   当 type = 'bar' 时，弹出的引导是浮窗引导，浮窗引导的展现力度比气泡引导更强，用户在组件上能进行“添加”操作。
        //   展现策略：
        //   - 10s 后自动消失。
        //   - 每位用户最多触达【2 次】，最短间隔【一周】才能第二次展现。
        //@ts-ignore
        tt.showFavoriteGuide({
            type: "bar",
            content: "一键添加到「我的小程序」",
            position: "bottom",
            success(res: any) {
                console.log("引导组件展示成功", res['errMsg']);
            },
            fail(err: any) {
                console.log("引导组件展示失败", err['errMsg']);
            },
        });
    }
    openAwemeUserProfile(reslove: Function) {
        // @ts-ignore
        tt.openAwemeUserProfile({
            success(res: Object) {
                reslove(true);
            },
            fail(e: Object) {
                reslove(false);
            }
        });
    }
    login() {
        //@ts-ignore
        tt.login({
            force: true,
            success(res: any) {
                console.log(TAG, '登录成功');
                _bytedance.Instance.getUserInfo();
            },
            fail(err: any) {
                console.warn(TAG, '登录失败');
            }
        });
    }
    getUserInfo() {
        //@ts-ignore
        tt.getUserInfo({
            withCredentials: false,
            success(res: any) {
                console.log(TAG, '用户信息获取成功:', res.userInfo);
            },
            fail(e: any) {
                console.warn(TAG, '用户信息获取失败:', e);
            }
        });
    }
}
export const ch_bytedance = _bytedance;