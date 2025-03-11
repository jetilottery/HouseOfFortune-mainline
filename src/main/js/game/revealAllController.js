/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
	'skbJet/componentCRDC/gladRenderer/gladButton',
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'../game/gameUtils'
], function (GladButton, msgBus, audio, gr, loader, SKBeInstant, gameUtils) {

	var allNeedToTeveal = [];
	var revealAllsClicked = false;
	var playButton, playButtonMTM;
	var clickedFlag;
	var symbolRevealInterval;

	function onGameParametersUpdated() {
		gr.lib._buttonPlay.show(false);
		gr.lib._buttonPlayMTM.show(false);
		gr.lib._textPlay.setText(loader.i18n.Game.button_play);
		gameUtils.setTextStyle(gr.lib._textPlay,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
		gr.lib._textPlayMTM.setText(loader.i18n.Game.button_playMTM);
		gameUtils.setTextStyle(gr.lib._textPlayMTM,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
		playButton = new GladButton(gr.lib._buttonPlay, 'buttonPlay',{'scaleWhenClick':0.92});
		playButtonMTM = new GladButton(gr.lib._buttonPlayMTM, 'buttonPlay',{'scaleWhenClick':0.92});
		resetAll();
		for (var i = 0; i < 9; i++) {
			allNeedToTeveal.push(gr.lib['_Symbol_0' + i]);
		}
        if(SKBeInstant.config.customBehavior) {
            symbolRevealInterval = SKBeInstant.config.customBehavior.symbolRevealInterval || 500;
        } else{
            symbolRevealInterval = 500;
        }		
	}

	function resetAll() {
		revealAllsClicked = false;
		clickedFlag = false;
		clearTimeListener();
	}

	function clearTimeListener(){
		for(var i = 0; i < allNeedToTeveal.length; i++){
			if(allNeedToTeveal[i].timer){
			    gr.getTimer().clearTimeout(allNeedToTeveal[i].timer);
			}
		}
	}

	function onStartUserInteraction(data) {
		 var enable = SKBeInstant.config.autoRevealEnabled === false? false: true;
		if(enable){
			if(data.scenario){
				gr.lib._buttonPlay.show(true);
				gr.lib._buttonPlayMTM.show(true);
			}
		}else{
			gr.lib._buttonPlay.show(false);
			gr.lib._buttonPlayMTM.show(false);
		}
		function revealAll() {
			var timeDelay = 0;
			msgBus.publish('disableUI');
			msgBus.publish('startRevealAll');
			for (var i = 0; i < allNeedToTeveal.length; i++) {
				if (!allNeedToTeveal[i].revealFlag) {
					allNeedToTeveal[i].timer = gr.getTimer().setTimeout(allNeedToTeveal[i].reveal,timeDelay);
					timeDelay += symbolRevealInterval;
				}
			}
			clickedFlag = true;
			playButton.show(false);
			playButtonMTM.show(false);
			revealAllsClicked = true;
			audio.play("ButtonGeneric");
		}
        if(data.price) {
		    playButton.show(true);
			playButtonMTM.show(true);
		} else {
			playButton.show(false);
			playButtonMTM.show(true);
		}

		playButton.click(revealAll);
		playButtonMTM.click(revealAll);
	}

	function onReStartUserInteraction(data) {
		resetAll();
		onStartUserInteraction(data);
	}

	function onReInitialize() {
		resetAll();
		playButton.show(false);
		playButtonMTM.show(false);
	}

	function onStopRevealAll(){
		clearTimeListener();
	}

	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLotterySKB.reset', resetAll);
	msgBus.subscribe('restart', resetAll);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('allFortuneRevealed', function () {
		gr.lib._buttonPlay.show(false);
		gr.lib._buttonPlayMTM.show(false);
	});
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('stopRevealAll',onStopRevealAll);
	return {};
});