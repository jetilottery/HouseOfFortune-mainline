/**
 * @module game/playWithMoney
 * @description play with money button control
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
	var count = 0;
	var buttonMTM;
    var inGame = false;

	function enableButton() {
		if ((SKBeInstant.config.wagerType === 'BUY') || (SKBeInstant.config.jLotteryPhase === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
			//return;
			gr.lib._Money.show(true);
			gr.lib._Try.show(false);
		} else {
			//0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
			//1..N: number of demo wagers before showing Move-To-Money-Button.
			//(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
			//the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
			if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)){
				gr.lib._Money.show(false);
				gr.lib._Try.show(true);
				gr.lib._buttonMTM.show(true);				 
			} else{
				gr.lib._Money.show(true);
				gr.lib._Try.show(false);
			}
		}
	}

	function onStartUserInteraction() {
		inGame = true;
		if(SKBeInstant.config.gameType === 'normal'){
			gr.lib._Money.show(true);
			gr.lib._Try.show(false);
    	}
	}

	function onReStartUserInteraction() {
		inGame = true;
        gr.lib._Money.show(true);
        gr.lib._Try.show(false);
	}

	function onDisableUI() {
		gr.lib._buttonMTM.show(false);	
	}

	function onEnableUI(){
		enableButton();
	}

	function onOpenTutorial(){
		gr.lib._Try.show(false);
		gr.lib._Money.show(false);
	}

	function onCloseTutorial(){
		if(inGame){
            gr.lib._Try.show(false);
		    gr.lib._Money.show(true);
		} else{
            enableButton();
		}		
	}

	function onReInitialize(){
		inGame = false;
		enableButton();
	}

	//When the RESULT_SCREEN state is reached,plus count,
	//the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))                
	function onEnterResultScreenState() {
        count++;
		inGame = false;
        gr.getTimer().setTimeout(function(){
            enableButton();
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
	}
	
	function onGameParametersUpdated(){
		var style = {padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5};
		var scaleType = {'scaleWhenClick':0.92};
		
		gr.lib._textMTM.setText(loader.i18n.Game.button_move2moneyGame);
		gr.lib._textResMTM.setText(loader.i18n.Game.button_resMTM);
		buttonMTM = new GladButton(gr.lib._buttonMTM, 'buttonPlay',scaleType);
		new GladButton(gr.lib._buttonResMTM, 'buttonPlay', scaleType);
		gameUtils.setTextStyle(gr.lib._textMTM,style);
		gameUtils.setTextStyle(gr.lib._textPlayMTM,style);
		gameUtils.setTextStyle(gr.lib._textResMTM,style);		
		enableButton();

		function clickMTM(){
            gr.lib._Try.show(false);
			SKBeInstant.config.wagerType = 'BUY';
			msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
			audio.play('ButtonGeneric');
		}
		buttonMTM.click(clickMTM);   
	}
	
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLotterySKB.reset', function(){
		inGame = false;
        enableButton();
	});
	msgBus.subscribe('disableUI', onDisableUI);
	msgBus.subscribe('enableUI', onEnableUI);
	msgBus.subscribe('openTutorial', onOpenTutorial);
	msgBus.subscribe('closeTutorial', onCloseTutorial);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);

	return {};
});