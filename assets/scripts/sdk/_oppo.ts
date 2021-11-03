import { param } from "./type";
const TAG = '_oppo.ts';
class _oppo {
    private static Instance: _oppo;
    private bannerId: string = "";
    private videoId: string = "";
    private bannerAd: any = null;
    private videoAd: any = null;
    private OnVideoCallBackListener: Function = null;
    private bannerAd_showNum: number = 20;
    private sdkInitEnd: boolean = false;
    private initTime: number = 0;
    constructor() {
        console.log(TAG, 'init platform channel: oppo_play');
    }
    public static getInstance(): _oppo {
        if (this.Instance == null) {
            this.Instance = new _oppo();
            this.Instance.initTime = new Date().getTime();
        }
        return this.Instance;
    }
    initAdParams(param: param) {
        if (this.sdkInitEnd) {
            return;
        }
        this.sdkInitEnd = true;
        this.bannerId = param.bannerId;
        this.videoId = param.videoId;
        this.initVideoAd();
        this.initBannerAd();
        ///> 新平台版本号'1051'（minPlatformVersion> ='1051'）已经不再需要进行广告初始化qg.initAdService(object);
    }
    initBannerAd() {
        let self: _oppo = this;
        //@ts-ignore
        var bannerAd = qg.createBannerAd({
            posId: this.bannerId
        });
        this.bannerAd = bannerAd;
        this.bannerAd.onHide(() => {
            self.bannerAd_showNum -= 1;
            console.log(TAG, "banner 广告隐藏!");
        });
        this.bannerAd.onShow(() => {
            console.log(TAG, "banner 广告显示!");
        });
        this.bannerAd.onError((err: any) => {
            switch (err['errCode']) {
                case 1001:
                    console.warn(TAG, '1.传参是否有误!');
                    console.warn(TAG, '2.是否使用了不支持的方法操作!');
                    console.warn(TAG, '3.不要重复拉取广告，我们制定限制!');
                    console.warn(TAG, '4.广告资源位是否没有申请!');
                    break;
                case 1002:
                    console.warn(TAG, '广告必须在19/14之后的Android版本上显示，一般是包名错误导致的!');
                    break;
                case 1003:
                    console.warn(TAG, '无广告返回!');
                    break;
                case 1004:
                    console.warn(TAG, '1.OPPO开放平台查看广告是否异常，异常则重新申请!');
                    console.warn(TAG, '1.检查手机设置的时间是否晚于现在实际的时间，若是，请设置与北京时间相同!');
                    console.warn(TAG, '1.在包名正确情况下，概率性偏移20003报错属于正常现象，报错与广告填充率/短时间交替拉取广告有关，请上架后前往OPPO广告联盟后台，查看广告数据是否正常（填充率是否正常）；继续拉取广告，是会拉取不到广告，因为我们对拉取频次作了限制!');
                    break;
            }
        });
    }
    bannerAd_show() {
        if (this.bannerAd_showNum <= 0 || new Date().getTime() - this.initTime < 60000) {
            return;
        }
        this.bannerAd.show();
    }
    bannerAd_hide() {
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
            this.initBannerAd();
        }
    }
    initVideoAd() {
        let self: _oppo = this;
        //@ts-ignore
        this.videoAd = qg.createRewardedVideoAd({
            posId: self.videoId
        });
        this.videoAd.onLoad(function () {
            self.videoAd.show();
        });
        this.videoAd.onError(function (err: any) {
            switch (err['errCode']) {
                case 1001:
                    console.warn(TAG, '1.传参是否有误!');
                    console.warn(TAG, '2.是否使用了不支持的方法操作!');
                    console.warn(TAG, '3.不要重复拉取广告，我们制定限制!');
                    console.warn(TAG, '4.广告资源位是否没有申请!');
                    break;
                case 1002:
                    console.warn(TAG, '广告必须在19/14之后的Android版本上显示，一般是包名错误导致的!');
                    break;
                case 1003:
                    console.warn(TAG, '无广告返回!');
                    break;
                case 1004:
                    console.warn(TAG, '1.OPPO开放平台查看广告是否异常，异常则重新申请!');
                    console.warn(TAG, '1.检查手机设置的时间是否晚于现在实际的时间，若是，请设置与北京时间相同!');
                    console.warn(TAG, '1.在包名正确情况下，概率性偏移20003报错属于正常现象，报错与广告填充率/短时间交替拉取广告有关，请上架后前往OPPO广告联盟后台，查看广告数据是否正常（填充率是否正常）；继续拉取广告，是会拉取不到广告，因为我们对拉取频次作了限制!');
                    break;
            }
            //@ts-ignore
            qg.showToast({
                title: '暂时没有视频广告了，请稍后再试！',
                icon: 'none',
                duration: 2000
            });
        });
        this.videoAd.onClose((res: any) => {
            if (res.isEnded) {
                self.OnVideoCallBackListener(true);
            } else {
                self.OnVideoCallBackListener(false);
            }
        });
    }
    videoAd_show(OnVideoCall: Function) {
        this.OnVideoCallBackListener = OnVideoCall;
        this.videoAd.load();
    }
    _oppoPush(packgeName: string = '') {
        // @ts-ignore
        qg.navigateToMiniGame({ pkgName: packgeName });
    }
    shakeDevice() {
        // @ts-ignore
        qg.vibrateShort({});
    }
}
export const ch_oppo = _oppo;