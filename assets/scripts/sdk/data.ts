export namespace data {
    const channel = cc.sys.platform;
    const path_playerbase = 'json/player_data';
    const path_gamebase = 'json/gamebase_data';
    const storageKey: string = 'ttgame_caiji_huochairenfuchou4'

    var player_data: Object = null;
    var gamebase_data: Object = null;

    /**
     * 初始化数据
     * @param deleteCache 重置
     */
    export async function init(deleteCache: boolean = false): Promise<any[]> {
        if (player_data && gamebase_data) {
            return Promise.resolve(['数据已加载']);
        }
        if (deleteCache) {
            await deleteCacheFunc();
        }
        let pormises: Promise<string>[] = [];
        pormises.push(getLocalStorage(), getStorage());
        return Promise.all(pormises);
    }
    /**
     * 读取` gamebase_data ` 中键值为` key1 `的值。
     * @param key 键值，`key`
     */
    export function gameJson<T>(key: string): T;
    /**
     * 读取` gamebase_data ` 子对象` key1 `中键值为` key2 `的值。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     */
    export function gameJson<T>(key1: string, key2: string): T;
    /**
     * 读取` gamebase_data ` 子对象` key1 `的子对象` key2 `中键值为` key3 `的值。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param key3 键值3，`key3`
     */
    export function gameJson<T>(key1: string, key2: string, key3: string): T;
    /**
     * 读取` gamebase_data ` 子对象` key1 `的子对象` key2 `的子对象` key3 `中键值为` key4 `的值。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param key3 键值3，`key3`
     * @param key4 键值4，`key4`
     */
    export function gameJson<T>(key1: string, key2: string, key3: string, key4: string): T;
    export function gameJson<T>(key1: string, key2?: string, key3?: string, key4?: string): T {
        if (key4!=undefined) {
            return gamebase_data[key1][key2][key3][key4];
        }
        if (key3!=undefined && key4 == undefined) {
            return gamebase_data[key1][key2][key3];
        }
        if (key2!=undefined && key3 == undefined) {
            return gamebase_data[key1][key2];
        }
        if (key1!=undefined && key2 == undefined) {
            return gamebase_data[key1];
        }
    }
    /**
     * 读取` player_data `中键值为` key `的值。
     * @param key 键值，`key`
     */
    export function getCache<T>(key: string): T;
    /**
     * 读取` player_data `的子对象` key1 `中键值为` key2 `的值。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     */
    export function getCache<T>(key1: string, key2: string): T;
    /**
     * 读取` player_data `的子对象` key1 `的子对象` key2 `中键值为` key3 `的值。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param key3 键值3，`key3`
     */
    export function getCache<T>(key1: string, key2: string, key3: string): T;
    /**
     * 读取` player_data `的子对象` key1 `的子对象` key2 `的子对象` key3 `中键值为` key4 `的值。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param key3 键值3，`key3`
     * @param key4 键值4，`key4`
     */
    export function getCache<T>(key1: string, key2: string, key3: string, key4: string): T;
    export function getCache<T>(key1: string, key2?: string, key3?: string, key4?: string): T {
        if (key4!=undefined) {
            return player_data[key1][key2][key3][key4];
        }
        if (key3!=undefined && key4 == undefined) {
            return player_data[key1][key2][key3];
        }
        if (key2!=undefined && key3 == undefined) {
            return player_data[key1][key2];
        }
        if (key1!=undefined && key2 == undefined) {
            return player_data[key1];
        }
    }
    /**
     * 将` player_data `中的键值为` key `的值修改为` value `。
     * @param key1 键值，`key`
     * @param value 更新数据
     */
    export function updateCache<T>(key: string, value: T): void;
    /**
     * 将` player_data `的子对象` key1 `中的键值为` key2 `的值修改为` value `。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param value 更新数据
     */
    export function updateCache<T>(key1: string, key2: string, value: T): void;
    /**
     * 将` player_data `的子对象` key1 `的子对象` key2 `中的键值为` key3 `的值修改为` value `。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param key3 键值3，`key3`
     * @param value 更新数据
     */
    export function updateCache<T>(key1: string, key2: string, key3: string, value: T): void;
    /**
     * 将` player_data `的子对象` key1 `的子对象` key2 `的子对象` key3 `中的键值为` key4 `的值修改为` value `。
     * @param key1 键值1，`key1`
     * @param key2 键值2，`key2`
     * @param key3 键值3，`key3`
     * @param key4 键值4，`key4`
     * @param value 更新数据
     */
    export function updateCache<T>(key1: string, key2: string, key3: string, key4: string, value: T): void;
    export function updateCache<T>(arg1: T, arg2: T, arg3?: T, arg4?: T, arg5?: T) {
        if (arg5!= undefined) {
            player_data[String(arg1)][String(arg2)][String(arg3)][String(arg4)] = arg5;
        }
        if (arg4 != undefined&& arg5 == undefined) {
            player_data[String(arg1)][String(arg2)][String(arg3)] = arg4;
        }
        if (arg3!= undefined && arg4 == undefined) {
            player_data[String(arg1)][String(arg2)] = arg3;
        }
        if (arg2 != undefined&& arg3 == undefined) {
            player_data[String(arg1)] = arg2;
        }
        setStorage();
    }
    /**
     * 在` player_data `中插入键值对` key1=value `
     * @param key 键值，`key`
     * @param value 插入数据
     */
    export function addCache<T>(key: string, value: T): void;
    /**
     * 在` player_data `的子对象` key1 `中插入键值对` key2=value `
     * @param key1 键值，`key1`
     * @param key2 键值，`key2`
     * @param value 插入数据
     */
    export function addCache<T>(key1: string, key2: string, value: T): void;
    /**
     *  在` player_data `的子对象` key1 `的子对象` key2 `中插入键值对` key3=value `
     * @param key1 键值，`key1`
     * @param key2 键值，`key2`
     * @param key3 键值，`key3`
     * @param value 插入数据
     */
    export function addCache<T>(key1: string, key2: string, key3: string, value: T): void;
    /**
     * 在` player_data `的子对象` key1 `的子对象` key2 `的子对象` key3 `中插入键值对` key4=value `
     * @param key1 键值，`key1`
     * @param key2 键值，`key2`
     * @param key3 键值，`key3`
     * @param key4 键值，`key4`
     * @param value 插入数据
     */
    export function addCache<T>(key1: string, key2: string, key3: string, key4: string, value: T): void;
    export function addCache<T>(arg1: string, arg2: T, arg3?: T, arg4?: T, arg5?: T) {
        let checkData: T;
        let baseData: string;
        let object: Object = new Object();

        if (arg5!=undefined) {
            checkData = player_data[arg1][arg2][arg3][arg4];
            if (!checkData) {
                object[String(arg4)] = arg5;
                Object.assign(player_data[arg1][arg2][arg3], object);
                baseData = JSON.stringify(player_data);
                console.log('添加字段:' + arg4 + '=' + arg5);
            } else {
                console.log('添加失败,已存在键值对:' + arg4 + '=' + arg5);
            }
        }
        if (arg4 !=undefined&& arg5 == undefined) {
            checkData = player_data[arg1][arg2][arg3];
            if (!checkData) {
                object[String(arg3)] = arg4;
                Object.assign(player_data[arg1][arg2], object);
                baseData = JSON.stringify(player_data);
                console.log('添加字段:' + arg3 + '=' + arg4);
            } else {
                console.log('添加失败,已存在键值对:' + arg3 + '=' + arg4);
            }
        }
        if (arg3!=undefined && arg4 == undefined) {
            checkData = player_data[arg1][arg2];
            if (!checkData) {
                object[String(arg2)] = arg3;
                Object.assign(player_data[arg1], object);
                baseData = JSON.stringify(player_data);
                console.log('添加字段:' + arg2 + '=' + arg3);
            } else {
                console.log('添加失败,已存在键值对:' + arg2 + '=' + arg3);
            }
        }
        if (arg2!=undefined && arg3 == undefined) {
            checkData = player_data[arg1];
            if (!checkData) {
                object[String(arg1)] = arg2;
                Object.assign(player_data, object);
                baseData = JSON.stringify(player_data);
                console.log('添加字段:' + arg1 + '=' + arg2);
            } else {
                console.log('添加失败,已存在键值对:' + arg1 + '=' + arg2);
            }
        }
        switch (channel) {
            case cc.sys.BYTEDANCE_GAME:
                //@ts-ignore
                tt.setStorage({
                    key: storageKey,
                    data: baseData,
                    success(res: any) {
                        console.log('字段添加成功!');
                    },
                    fail(res: any) {
                        console.log('字段添加失败!');
                    }
                });
                break;
            default:
                console.log('字段添加成功!');
                cc.sys.localStorage.setItem(storageKey, baseData);
                break;
        }
    }
    function getStorage(): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            switch (channel) {
                case cc.sys.WECHAT_GAME:
                    // @ts-ignore
                    wx.getStorage({
                        key: storageKey,
                        success(res: any) {
                            player_data = JSON.parse(res.data);
                            checkData(player_data, resolve);
                        },
                        fail(res: any) {
                            loadPlayerData(resolve);
                        }
                    });
                    break;
                case cc.sys.BYTEDANCE_GAME:
                    // @ts-ignore
                    tt.getStorage({
                        key: storageKey,
                        success(res: any) {
                            player_data = JSON.parse(res.data);
                            checkData(player_data, resolve);
                        },
                        fail(res: any) {
                            loadPlayerData(resolve);
                        }
                    });
                    break;
                case cc.sys.QQ_PLAY:
                    // @ts-ignore
                    qq.getStorage({
                        key: storageKey,
                        success(res: any) {
                            player_data = JSON.parse(res.data);
                            checkData(player_data, resolve);
                        },
                        fail(res: any) {
                            loadPlayerData(resolve);
                        }
                    });
                    break;
                default:
                    try {
                        //从本地读取数据
                        var baseData = cc.sys.localStorage.getItem(storageKey);
                        //将string转换成json
                        player_data = JSON.parse(baseData);
                        checkData(player_data, resolve);
                    } catch (error_temp) {
                        console.log(error_temp);
                    }
                    break;
            }
        });
    }
    function checkData(data: Object, cb: Function) {
        if (data) {
            cb('<加载缓存玩家数据>');
        } else {
            loadPlayerData(cb);
        }
    }
    function loadPlayerData(cb: Function) {
        load(path_playerbase).then(base => {
            player_data = base;
            cb('<加载缓存玩家数据>');
        });
    }
    function getLocalStorage(): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            load(path_gamebase).then(base => {
                gamebase_data = base;
                resolve('加载游戏数据');
            });
        });
    }
    function setStorage() {
        var baseData = JSON.stringify(player_data);
        switch (channel) {
            case cc.sys.WECHAT_GAME:
                // @ts-ignore
                wx.setStorage({
                    key: storageKey, data: baseData
                });
                break;
            case cc.sys.BYTEDANCE_GAME:
                // @ts-ignore
                tt.setStorage({
                    key: storageKey, data: baseData
                });
                break;
            case cc.sys.QQ_PLAY:
                // @ts-ignore
                qq.setStorage({
                    key: storageKey, data: baseData
                });
                break;
            default:
                cc.sys.localStorage.setItem(storageKey, baseData);
                break;
        }
    }
    function deleteCacheFunc() {
        return new Promise((resolve: Function, reject: Function) => {
            switch (channel) {
                case cc.sys.WECHAT_GAME:
                    // @ts-ignore
                    wx.clearStorage({
                        success(res: any) {
                            resolve();
                        },
                        fail(res: any) {
                            reject();
                        }
                    });
                    break;
                case cc.sys.BYTEDANCE_GAME:
                    // @ts-ignore
                    tt.clearStorage({
                        success(res: any) {
                            resolve();
                        },
                        fail(res: any) {
                            reject();
                        }
                    });
                    break;
                case cc.sys.QQ_PLAY:
                    //@ts-ignore
                    qq.clearStorage({
                        success(res: any) {
                            resolve();
                        },
                        fail(res: any) {
                            reject();
                        }
                    });
                    break;
                default:
                    cc.sys.localStorage.removeItem(storageKey);
                    resolve();
                    break;
            }
        });
    }
    function load(path: string): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            cc.resources.load(path, cc.JsonAsset, (err, object: any) => {
                if (err) {
                    console.log(err);
                    resolve(`加载:${path}失败!`);
                } else {
                    resolve(object.json);
                }
            });
        });
    }
}