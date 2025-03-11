/**
 * @module game/buyAndTryController
 * @description buy and try button control
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

	var currentTicketCost = null;
	var replay = false;
	var buttonBuy;
	var buttonTry;
	var mtmJFlag = false;
    
	function onGameParametersUpdated(){	
		setFontAuto();
		gameUtils.setTextStyle(gr.lib._textBuy,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
		gameUtils.setTextStyle(gr.lib._textTry,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
		buttonBuy = new GladButton(gr.lib._buttonBuy,'buttonPlay',{'scaleWhenClick':0.92});
	    buttonTry = new GladButton(gr.lib._buttonTry,'buttonPlay', {'scaleWhenClick':0.92});
		buttonBuy.show(false);
		buttonTry.show(false);	
		resetAll();	
		gr.lib._textTry.setText(loader.i18n.Game.button_try);
        buttonBuy.click(buyOrTryClickEvent);
		buttonTry.click(buyOrTryClickEvent);
		gr.lib._refresh.show(false);
	}

	function setFontAuto(){
        gr.lib._textResMTM.autoFontFitText = true;
        gr.lib._textPlayMTM.autoFontFitText = true;
		gr.lib._textTry.autoFontFitText = true;
        gr.lib._textMTM.autoFontFitText = true;
        gr.lib._textExit.autoFontFitText = true;
        gr.lib._textRestart.autoFontFitText = true;
		gr.lib._textPlay.autoFontFitText = true;
		gr.lib._textBuy.autoFontFitText = true;
    }

	function resetAll(){
        if(SKBeInstant.config.wagerType === 'BUY'){gr.lib._textBuy.setText(loader.i18n.Game.button_buy);}		    
		else{gr.lib._textBuy.setText(loader.i18n.Game.button_try);}	    
		gr.lib._refresh.show(false);
	}

	function buyOrTryClickEvent(){
		msgBus.publish('buyOrTryHaveClicked');
		play();
	}

	function play() {
		gr.animMap._refreshing._onComplete = function(){
			this.play();
		};
		gr.lib._refresh.show(true);
		gr.animMap._refreshing.play();
		if (replay) {
			msgBus.publish('jLotteryGame.playerWantsToRePlay', {price:currentTicketCost});
		} else {
			msgBus.publish('jLotteryGame.playerWantsToPlay', {price:currentTicketCost});
		}
		buttonBuy.show(false);
		buttonTry.show(false);
		audio.play('ButtonGeneric');
		msgBus.publish('playerBuyOrTry');
		msgBus.publish('disableUI');
	}

	function onStartUserInteraction(data) {
		gr.animMap._refreshing.stop();
		gr.lib._refresh.show(false);
		currentTicketCost = data.price;
		replay = true;
	}

	function onReStartUserInteraction(data){
		onStartUserInteraction(data);
	}
	function showBuyOrTryButton() {
		if (SKBeInstant.config.jLotteryPhase !== 2) {
			return;
		}
		buttonBuy.show(true);
		buttonTry.show(true);
	}

	function onInitialize() {
		showBuyOrTryButton();
	}

	function onTicketCostChanged(data) {
		currentTicketCost = data;
	}

	function onReInitialize() {
		if(mtmJFlag){
			replay = false;
	    }
		resetAll();
		showBuyOrTryButton();
	}

	function onRestart(){
		showBuyOrTryButton();
	}
	
	function onPlayerWantsToMoveToMoney(){
        mtmJFlag = true;
    }

	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoney);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('restart', onRestart);
	msgBus.subscribe('jLotterySKB.reset', function(){
		resetAll();	
		showBuyOrTryButton();
	});

	return {};
});