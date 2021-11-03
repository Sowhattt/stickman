import { param } from "./type";

const TAG = '_qq.ts';
class _qq {
    private static Instance: _qq;
    private videoAd: any = null;
    private bannerAd: any = null;
    private insertAd: any = null;
    private appBoxAd: any = null;
    private videoAdId: string = "";
    private insertAdId: string = "";
    private bannerAdId: string = "";
    private appBoxAdId: string = "";
    private OnVideoCallBackListener: Function = null;
    private sdkInitEnd: boolean = false;
    private constructor() {
        console.log(TAG, 'init platform channel: _qq_play');
    }
    static getInstance(): _qq {
        if (this.Instance == null) {
            this.Instance = new _qq();
        }
        return this.Instance;
    }
    initAdParams(param: param) {
        if (this.sdkInitEnd) {
            return;
        }
        this.sdkInitEnd = true;
        this.insertAdId = param.insertId;
        this.bannerAdId = param.bannerId;
        this.videoAdId = param.videoId;
        this.appBoxAdId = param.appBoxId;
        this.initBannerAd();
    }
    buttonShare(OnShareCall: Function, Protexture: string | null, desTxt: string | null) {
        // @ts-ignore
        _qq.shareAppMessage({
            title: desTxt,        ///> "合成小游戏搭配经典像素风格，玩转僵尸大风暴！"
            imageUrl: Protexture, ///> "res/raw-assets/a0/a0100032-933c-4057-a5c4-d8d2bd9f8d0d.png"
            query: "key1=val1",
            success(res: any) {
                OnShareCall(true);
            },
            fail(e: any) {
                OnShareCall(false);
            }
        });
    }
    initVideoAd() {
        //@ts-ignore
        this.videoAd = _qq.createRewardedVideoAd({
            adUnitId: this.videoAdId
        });
        this.videoAd.onError((res: any) => {
            console.warn(TAG, '激励视频错误:', JSON.stringify(res))
        })
        this.videoAd.onLoad((res: any) => {
            this.videoAd.show();
        })
        this.videoAd.load();
        this.videoAd.onClose((res: any) => {
            if (res && res.isEnded) {
                this.OnVideoCallBackListener(true);
            } else {
                this.OnVideoCallBackListener(false);
            }
        });
    }
    initBannerAd() {
        let info: any = null;
        //@ts-ignore
        _qq.getSystemInfo({
            success(res: any) {
                info = res;
                console.log(TAG, res.windowWidth)
                console.log(TAG, res.windowHeight)
            }
        })
        let targetBannerAdWidth = 150;
        //@ts-ignore
        this.bannerAd = _qq.createBannerAd({
            adUnitId: this.bannerAdId,
            style: {
                left: 0,
                top: info.windowHeight - targetBannerAdWidth,
                width: targetBannerAdWidth,
                height: 200
            }
        })
        this.bannerAd.onResize((size: any) => {
            console.log("onResize", size.width, size.height);
            // 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
            this.bannerAd.style.left = (info.windowWidth - size.width) / 2;
            this.bannerAd.style.top = info.windowHeight - size.height;
            //这行是为了在QQ小游戏中能正确显示位置.如果是微信则不需要这句
            this.bannerAd.style.left = (info.windowWidth - size.width) / 2;
            this.bannerAd.style.top = info.windowHeight - size.height;
        });
        this.bannerAd.onError((e: any) => {
            console.warn(TAG, 'bannerAd onError!', e)
        })
        this.bannerAd.onLoad((res: any) => {
            console.warn(TAG, 'bannerAd onLoad!', res)
        });
    }
    insertAd_show() {
        if (this.insertAd != null) {
            this.insertAd.destroy();
        }
        //@ts-ignore
        this.insertAd = _qq.createInterstitialAd({
            adUnitId: this.insertAdId
        });
        this.insertAd.load().then((res: any) => {
            this.insertAd.show();
        });
        this.insertAd.onError((err: any) => {
            console.warn(TAG, `插屏广告错误:${JSON.stringify(err)}`);
        });
    }
    creatAppBoxAd() {
        //@ts-ignore
        this.appBoxAd = _qq.createAppBox({
            adUnitId: this.appBoxAdId
        });
    }
    appBoxAdShow() {
        this.creatAppBoxAd();
        this.appBoxAd.load().then(() => {
            this.appBoxAd.show();
        });
    }
    appBoxDestroy() {
        this.appBoxAd.destroy();
        this.appBoxAd = null;
    }
    videoAd_show(OnVideoCall: Function) {
        this.OnVideoCallBackListener = OnVideoCall;
        this.videoAd != null ? this.videoAd.load() : this.initVideoAd();
    }
    bannerAd_hide() {
        this.bannerAd.hide();
        this.bannerAd.destroy();
        this.initBannerAd();
    }
    bannerAd_show() {
        this.bannerAd.show().then(() => {
            console.log(TAG, 'banner广告显示成功!');
        }).catch((err: any) => {
            console.warn(TAG, `banner广告组件出现问题:${err}`);
        });
    }
    shakeDevice() {
        // @ts-ignore
        _qq.vibrateShort();
    }
}
export const ch_qq = _qq;