/**
 * @module audioController
 * @memberof game
 * @description
 * @author Alex Wang
 */
define([
	    'skbJet/componentCRDC/gladRenderer/gladButton',
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/audioPlayer/AudioPlayerProxy',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
		'skbJet/component/SKBeInstant/SKBeInstant'
	], function(GladButton, msgBus, audio, gr, SKBeInstant){
		var audioDisabled = false;
		var audioOn;
		var audioOff;

		function audioSwitch(){
			if(audioDisabled){
				gr.lib._buttonAudioOn.show(true);
				gr.lib._buttonAudioOff.show(false);
				audioDisabled = false;
				audio.muteAll(audioDisabled);
			}else{
			    gr.lib._buttonAudioOn.show(false);
				gr.lib._buttonAudioOff.show(true);
				audioDisabled = true;
				audio.muteAll(audioDisabled);
			}
            audio.gameAudioControlChanged(audioDisabled);
		}
		
		function onPlayerSelectedAudioWhenGameLaunch(data){
			if (SKBeInstant.config.assetPack === 'desktop') { //SKB desktop
				audio.muteAll(audioDisabled); //Audio component enable audio default value is true when desktop, with IW, game should use parameter instead of the default value.
                audio.gameAudioControlChanged(audioDisabled);
				return;
			}else{
				audioDisabled = data;
				audioSwitch();
			}
			if (SKBeInstant.config.gameType === 'ticketReady') {
				audio.play('BaseMusicLoop', 'base', true);            
			}
		}

		function onConsoleControlChanged(data) {
            if (data.option === 'sound'){
                var isMuted = audio.consoleAudioControlChanged(data); 
                if(isMuted){
                    gr.lib._buttonAudioOn.show(false);
                    gr.lib._buttonAudioOff.show(true);
                    audioDisabled = true;
                } else{
                    gr.lib._buttonAudioOn.show(true);
                    gr.lib._buttonAudioOff.show(false);
                    audioDisabled = false;
                }
            }
		}

		function audioButtonInit() {
			audioDisabled = SKBeInstant.config.soundStartDisabled;
			if (audioDisabled) {
				gr.lib._buttonAudioOn.show(false);
				gr.lib._buttonAudioOff.show(true);
				audio.muteAll(audioDisabled);
			} else {
				gr.lib._buttonAudioOn.show(true);
				gr.lib._buttonAudioOff.show(false);
			}
			audio.muteAll(audioDisabled);
			gr.lib._buttonAudioOn.on('click',audioSwitch);
			gr.lib._buttonAudioOff.on('click',audioSwitch);
		}

		function onStartUserInteraction(){
		    if(SKBeInstant.config.gameType === 'ticketReady' && SKBeInstant.config.assetPack !== 'desktop'){
			    return;
		    }else{
			    audio.play('BaseMusicLoop', 'base' , true);
			}
		}
		
		function onEnterResultScreenState(){
			audio.stopChannel('base');
		}
		
		function onReStartUserInteraction(){
			audio.play('BaseMusicLoop', 'base' , true);
		}

		function onReInitialize(){
			audio.stopAllChannel();
		}

		function onGameParametersUpdated(){			
			var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
			if(SKBeInstant.config.assetPack !== 'desktop'){
				audioDisabled = true;
			}
			audioOn = new GladButton(gr.lib._buttonAudioOn, 'buttonAudioOn',scaleType);
			audioOff = new GladButton(gr.lib._buttonAudioOff, 'buttonAudioOff',scaleType);
			audioButtonInit();
		}

		function resetAll(){
			audio.stopAllChannel();
		}
        
		msgBus.subscribe('jLottery.reInitialize', onReInitialize);
		msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
		msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
		msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
		msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
		msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
		msgBus.subscribe('jLotterySKB.reset', resetAll);
		msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
 
	return {};
});