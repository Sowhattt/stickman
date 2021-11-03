// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { audioName } from "../audioNameMgr";
import { caijiTools } from "../caijiTools";
import { data } from "../sdk/data";

const audioClipPath:string="sounds/";
const {ccclass, property} = cc._decorator;
@ccclass
export default class audioManager extends cc.Component {
    @property(cc.SpriteFrame)
    onSprite_audio:cc.SpriteFrame=null;
    @property(cc.SpriteFrame)
    offSprite_audio:cc.SpriteFrame=null;
    @property(cc.Node)
    soundSwitch:cc.Node=null;

    isHaveBgm:boolean=true;
    static audioNumber_bgMenu:number=-1;
    static audioNumber_bgGame:number=-1;
    static now_Volume:number=1;
    static isAudioInit:boolean=false;
    static instance:audioManager=null;
    static audioClips:Map<string,cc.AudioClip>=new Map;
    onLoad () {
        audioManager.instance=this;
    }
    start () {
        this.init();
    }
    onDisable(){
        this.bgOff();
    }

    async init(){
        let bg:cc.AudioClip=null;
        this.soundSwitch.active=true;
        let soundOnOrOff=Number(data.getCache("Base","sound"));
        this.soundSwitch.getComponent(cc.Sprite).spriteFrame=soundOnOrOff==0?this.offSprite_audio:this.onSprite_audio;
        if(audioManager.isAudioInit==true) return;
        audioManager.isAudioInit=true;
        if(this.isHaveBgm==false) return;
        if(audioManager.audioNumber_bgMenu==-1){
            bg=await caijiTools.loadAudioClipBundle("sounds",audioName.bgm_main);
            let id=cc.audioEngine.play(bg, true,1 * audioManager.now_Volume);
            audioManager.audioNumber_bgMenu=id;
            if(soundOnOrOff==0){
                cc.audioEngine.pause(audioManager.audioNumber_bgMenu);
            }
        }else{
            if(soundOnOrOff==1){
                cc.audioEngine.resume(audioManager.audioNumber_bgMenu);
            }
        }
    }
    bgOff(){
        cc.audioEngine.pause(audioManager.audioNumber_bgMenu);
    }
    static async playBgGame(){
        if(Number(data.getCache("Base","sound"))==0){
        }else{
            if(audioManager.audioNumber_bgGame==-1){
                let bg=await caijiTools.loadAudioClipBundle("sounds",audioName.bgm_game);
                audioManager.audioNumber_bgGame=cc.audioEngine.play(bg, true,1 * audioManager.now_Volume);
            }else{
                cc.audioEngine.resume(audioManager.audioNumber_bgGame);
            }
        }
    }
    static pauseBgGame(){
        if(audioManager.audioNumber_bgGame==-1) return;
        cc.audioEngine.pause(audioManager.audioNumber_bgGame);
    }
    soundControl(){
        if(audioManager.isAudioInit==false) return;
        if(Number(data.getCache("Base","sound"))==0){
            data.updateCache("Base","sound",1);
            this.soundSwitch.getComponent(cc.Sprite).spriteFrame=this.onSprite_audio;
            if(this.isHaveBgm)
            cc.audioEngine.resume(audioManager.audioNumber_bgMenu);
        }else{
            data.updateCache("Base","sound",0);
            this.soundSwitch.getComponent(cc.Sprite).spriteFrame=this.offSprite_audio;
            if(this.isHaveBgm)
            cc.audioEngine.pause(audioManager.audioNumber_bgMenu);
        }
    }
/*     shockControl(){
        if(Number(AppData.Instance.getCache("Base","shock"))==0){
            AppData.Instance.updateCache("Base","shock",1);
            this.shockSwitch.children[0].getComponent(cc.Sprite).spriteFrame=this.onSprite_shock;
            audioManager.shock();
        }else{
            AppData.Instance.updateCache("Base","shock",0);
            this.shockSwitch.children[0].getComponent(cc.Sprite).spriteFrame=this.offSprite_shock;
        }
    } */
    static async playAudio(Name,isLoop:boolean=null,audioSize:number=null){
        if(Number(data.getCache("Base","sound")) == 1 ) {
            let isloop=isLoop==null?false:isLoop;
            let size=audioSize==null?1:audioSize;
            if(audioManager.audioClips.get(Name)){
                cc.audioEngine.play(audioManager.audioClips.get(Name), isloop,size * audioManager.now_Volume);
                return;
            }
            let AudioClip=await caijiTools.loadAudioClipBundle("sounds",Name);
            audioManager.audioClips.set(Name,AudioClip);
            return cc.audioEngine.play(AudioClip, isloop,size * audioManager.now_Volume);
        }
    }
    static stopAudio(id:number){
        cc.audioEngine.pause(id);
    }
    static shock(){
        if(Number(data.getCache("Base","shock"))==1){
        }
    }
}

