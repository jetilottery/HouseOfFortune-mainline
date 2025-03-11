/**
 * @module playRestartController
 * @description play restart control
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
    var buttonRestart, buttonResMTM;
    var restartTimeout;
    function playRestartButton(){
        //msgBus.publish('jLotteryGame.playAgain');
        audio.play("ButtonGeneric");
        gr.lib._buttonRestart.show(false);
        gr.lib._buttonResMTM.show(false);
        showMeterDim();
        gameUtils.fixMeter(gr);
        msgBus.publish('restart');
    }
    
    function showMeterDim(){
        gr.lib._ticketCost.show(true);
        gr.lib._buttonDim00.show(true);
    }
    
    function onGameParametersUpdated(){
        buttonRestart = new GladButton(gr.lib._buttonRestart, 'buttonPlay', {'scaleWhenClick':0.92});
        
        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._textRestart.setText(loader.i18n.Game.button_restart);
        } else{
            gr.lib._textRestart.setText(loader.i18n.Game.button_resMTM);
        }     
        gameUtils.setTextStyle(gr.lib._textRestart,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
        buttonRestart.click(playRestartButton);
        gr.lib._buttonRestart.show(false);
        buttonResMTM = new GladButton(gr.lib._buttonResMTM, 'buttonPlay', {'scaleWhenClick':0.92});  
        gr.lib._textResMTM.setText(loader.i18n.Game.button_resMTM);
        gameUtils.setTextStyle(gr.lib._textResMTM,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
        gr.lib._buttonResMTM.show(false);
        buttonResMTM.click(playRestartButton);    
    }

    function onReInitialize(){
        gr.lib._textRestart.setText(loader.i18n.Game.button_restart);
        gr.lib._buttonRestart.show(false);
        gr.lib._buttonResMTM.show(false);
        clearTimeout(restartTimeout);
    }

    function onEnterResultScreenState() {
		if (SKBeInstant.config.jLotteryPhase === 2) {
            restartTimeout = gr.getTimer().setTimeout(function(){
                gr.lib._buttonRestart.show(true);
                gr.lib._buttonResMTM.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
		}
	}
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

	return {};
});