/**
 * @module game/exitButton
 * @description exit button control
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
    var buttonExit;
	var buttonHome;
	var whilePlaying=false;
	var isWLA = false;
	function exitButton() {
		audio.play('ButtonGeneric');
		msgBus.publish('jLotteryGame.playerWantsToExit');
	}
	
	function onGameParametersUpdated(){
		buttonHome = new GladButton(gr.lib._buttonHome, 'buttonHome');
        buttonHome.click(exitButton);
		isWLA = SKBeInstant.isWLA()? true:false;
		gr.lib._textExit.setText(loader.i18n.Game.button_exit);
		gr.lib._buttonExit.on('click', exitButton);
		gameUtils.setTextStyle(gr.lib._textExit,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});		
		buttonExit = new GladButton(gr.lib._buttonExit,'buttonPlay',{'scaleWhenClick':0.92});
		//buttonExit.click(exitButton);
		buttonExit.show(false);
	}

	function onInitialize(){
		if(isWLA){
			if(Number(SKBeInstant.config.jLotteryPhase) === 1){
				buttonHome.show(false);
			}else{
				buttonHome.show(true);
			}
		}
	}

	function onEnterResultScreenState() {
		if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
			buttonExit.show(true);
		} else{
            gr.getTimer().setTimeout(function () {
				 whilePlaying = false;
				if(isWLA){gr.lib._buttonHome.show(true);}             
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
	}

	function onDisableUI() {
		buttonHome.show(false);
	}

	function onEnableUI() {
        if(Number(SKBeInstant.config.jLotteryPhase) === 2 && isWLA && !whilePlaying){ 
			buttonHome.show(true);
		}      
	}
    
    function onCloseTutorial(){
        if(Number(SKBeInstant.config.jLotteryPhase) === 2 && !whilePlaying && isWLA){
            buttonHome.show(true);
		}          
    }

	function onStartUserInteraction(){
		whilePlaying=true;
        buttonHome.show(false);
	}

	function onReStartUserInteraction(){
        onStartUserInteraction();
	}
    
    function onReInitialize(){
		whilePlaying = false;
		if(isWLA){gr.lib._buttonHome.show(true);}       
    }

	msgBus.subscribe('jLotterySKB.reset', onEnableUI);
	msgBus.subscribe('disableUI', onDisableUI);
	msgBus.subscribe('enableUI', onEnableUI);
	msgBus.subscribe('openTutorial', onDisableUI);	
	msgBus.subscribe('closeTutorial', onCloseTutorial);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	
	return {};
});