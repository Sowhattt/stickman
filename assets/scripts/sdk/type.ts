/**
 * 渠道参数
 */
export interface config {
    debug: param,
    bytedance_mini_game: param,
    wechat: param,
    oppo_play: param,
    vivo_play: param,
    qq_play: param
}
/**
 * 详细参数
 */
export interface param {
    appId?: string,
    insertId?: string,
    bannerId?: string,
    videoId?: string,
    nativeId?: string,
    appBoxId?: string,
    shareDesc?: string[]
}
/**
 * 原生广告回调
 * @param iconURL 广告ICON
 * @param imgURL  广告主体图片
 * @param onClick 广告点击监听
 */
export type native = (iconURL: string, imgURL: string, onClick: Function) => void;
