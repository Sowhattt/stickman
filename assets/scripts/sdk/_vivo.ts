import { native, param } from "./type";
const TAG = '_vivo.ts';
class _vivo {
    private static Instance: _vivo;
    private videoId: string = "";
    private bannerId: string = "";
    private insertId: string = "";
    private nativeId: string = "";
    private videoAd: any = null;
    private bannerAd: any = null;
    private OnVideoCallBackListener: Function = null;
    private sdkInitEnd: boolean = false;
    private showAdLastTime: number = 0;
    constructor() {
        console.log(TAG, 'init platform channel: vivo_play');
    }
    public static getInstance(): _vivo {
        if (this.Instance == null) {
            this.Instance = new _vivo();
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
        this.nativeId = param.nativeId;
        this.initBannderAd();
    }
    initBannderAd() {
        //@ts-ignore
        let bannerAd = qg.createBannerAd({
            posId: this.bannerId,
            style: {}
        });
        this.bannerAd = bannerAd;
        this.bannerAd.onError((err: any) => {
            console.warn(TAG, `banner广告加载失败:${JSON.stringify(err)}`);
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
            this.bannerAd.destroy();
            this.initBannderAd();
        }
    }
    initVideoAd() {
        //@ts-ignore
        this.videoAd = qg.createRewardedVideoAd({
            posId: this.videoId
        });
        this.videoAd.onLoad(() => {
            cc.audioEngine.pauseAll();
            this.videoAd.show();
            this.showAdLastTime = new Date().getTime();
        });
        this.videoAd.onClose((res: any) => {
            cc.audioEngine.resumeAll();
            if (res && res.isEnded) {
                this.OnVideoCallBackListener(true);
            } else {
                this.OnVideoCallBackListener(false);
            }
        });
        this.videoAd.onError((err: any) => {
            console.warn(TAG, `视频广告错误:${JSON.stringify(err)}`);
        });
        this.videoAd.load();
    }
    videoAd_show(OnVideoCall: Function) {
        let now: number = new Date().getTime();
        if (now - this.showAdLastTime < 60000) {
            //@ts-ignore
            qg.showToast({
                message: '每分钟只能看一次视频'
            });
            return;
        }
        this.OnVideoCallBackListener = OnVideoCall;
        this.videoAd != null ? this.videoAd.load() : this.initVideoAd();
    }
    insertAd_show() {
        // @ts-ignore
        var interstitialAd = qg.createInterstitialAd({
            posId: this.insertId
        });
        interstitialAd.onError((err: any) => {
            console.warn(TAG, `插屏广告错误:${JSON.stringify(err)}`);
        });
        interstitialAd.show();
    }
    shakeDevice() {
        // @ts-ignore
        qg.vibrateShort();
    }
    nativeAdShow(cb: native) {
        // @ts-ignore
        let nativeAd = qg.createNativeAd({
            posId: this.nativeId,
        });
        nativeAd.onLoad((res: any) => {
            console.log(TAG, `原生广告加载完成-onload触发:${JSON.stringify(res)}`);
            let nativeCurrentAd: any = null;
            if (res && res.adList) {
                nativeCurrentAd = res.adList.pop();
                ///> 上报曝光
                nativeAd.reportAdShow({ adId: nativeCurrentAd["adId"] });
                ///> 上报点击
                let tempClick: Function = () => {
                    console.log(TAG, '_vivo 原生点击');
                    nativeAd.reportAdClick({ adId: nativeCurrentAd["adId"] });
                }
                //展示广告
                if (nativeCurrentAd["icon"] != null && nativeCurrentAd["imgUrlList"][0] != null) {
                    cb(nativeCurrentAd["icon"], nativeCurrentAd["imgUrlList"][0], tempClick);
                }
            }
        });
        nativeAd.onError((err: any) => {
            switch (err.errCode) {
                case -3:
                    console.log(TAG, `原生广告加载失败---调用太频繁:${JSON.stringify(err)}`);
                    break;
                default:
                    console.log(TAG, `原生广告加载异常:${JSON.stringify(err)}`);
                    break;
            }
        });
        nativeAd.load().then(() => {
            console.log(TAG, `VIVO原生加载成功`);
        }).catch((err: any) => {
            console.warn(TAG, `VIVO原生加载失败:${JSON.stringify(err)}`);
        });
    }
}
export const ch_vivo = _vivo;
