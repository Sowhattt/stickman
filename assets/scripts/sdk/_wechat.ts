import { param } from "./type";

var TAG = '_wechat.ts';
class _wechat {
    private static Instance: _wechat = null;
    private videoAd: any = null;
    private bannerAd: any = null;
    private videoId: string = "";
    private bannerId: string = "";
    private insertId: string = "";
    private sdkInitEnd: boolean = false;
    private onVideoAdCallBack: Function = null;
    private insertAdTime = 0;
    constructor() {
        console.log(TAG, 'init platform channel: _wechat');
    }
    public static getInstance(): _wechat {
        if (this.Instance == null) {
            this.Instance = new _wechat();
        }
        return this.Instance;
    }
    initAdParams(param: param) {
        if (this.sdkInitEnd) {
            return;
        }
        this.sdkInitEnd = true;
        this.insertId = param.insertId;
        this.bannerId = param.bannerId;
        this.videoId = param.videoId;
    }
    initBannerAd() {
        // @ts-ignore
        const { windowWidth, windowHeight } = wx.getSystemInfoSync();
        var targetBannerAdWidth = 120;
        // 创建一个居于屏幕底部正中的广告
        // @ts-ignore
        this.bannerAd = wx.createBannerAd({
            adUnitId: this.bannerId,
            adIntervals: 120,
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
    initVideoAd() {
        //@ts-ignore
        if (wx.createRewardedVideoAd) {
            return;
        }
        //@ts-ignore
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: this.videoId,
            multiton: false
        });
        this.videoAd.onClose((res: any) => {
            if (res && res.isEnded) {
                this.onVideoAdCallBack(true);
            } else {
                this.onVideoAdCallBack(false);
            }
        });
        this.videoAd.onError((err: any) => {
            switch (err.errCode) {
                case 1000:
                    console.warn(TAG, `后端接口调用失败`);
                    break;
                case 1001:
                    console.warn(TAG, `参数错误`);
                    break;
                case 1002:
                    console.warn(TAG, `广告单元无效`);
                    break;
                case 1003:
                    console.warn(TAG, `内部错误`);
                    break;
                case 1004:
                    console.warn(TAG, `无合适的广告`);
                    break;
                case 1005:
                    console.warn(TAG, `广告组件审核中`);
                    break;
                case 1006:
                    console.warn(TAG, `广告组件被驳回`);
                    break;
                case 1007:
                    console.warn(TAG, `广告组件被封禁`);
                    break;
                case 1008:
                    console.warn(TAG, `广告单元已关闭`);
                    break;
            }
        });
        this.videoAd.onLoad((res: any) => {
            this.videoAd.show();
        });
        this.videoAd.load();
    }
    videoAd_show(onVideoCall: Function) {
        this.onVideoAdCallBack = onVideoCall;
        this.videoAd != null ? this.videoAd.load() : this.initVideoAd();
    }
    insterAd_show() {
        let time = new Date().getTime();
        if (time - this.insertAdTime < 30000) {
            console.log(TAG, '广告冷却中...');
            return;
        }
        this.insertAdTime = time;
        //@ts-ignore
        let interstitialAd = tt.createInterstitialAd({
            adUnitId: this.insertId
        });
        interstitialAd.onError((err: any) => {
            switch (err.errCode) {
                case 1000:
                    console.warn(TAG, `后端接口调用失败`);
                    break;
                case 1001:
                    console.warn(TAG, `参数错误`);
                    break;
                case 1002:
                    console.warn(TAG, `广告单元无效`);
                    break;
                case 1003:
                    console.warn(TAG, `内部错误`);
                    break;
                case 1004:
                    console.warn(TAG, `无合适的广告`);
                    break;
                case 1005:
                    console.warn(TAG, `广告组件审核中`);
                    break;
                case 1006:
                    console.warn(TAG, `广告组件被驳回`);
                    break;
                case 1007:
                    console.warn(TAG, `广告组件被封禁`);
                    break;
                case 1008:
                    console.warn(TAG, `广告单元已关闭`);
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
}
export const ch_wechat = _wechat;