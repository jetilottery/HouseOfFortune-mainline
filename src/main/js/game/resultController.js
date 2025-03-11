/**
 * @module game/resultDialog
 * @description result dialog control
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

    var allFortuneRevealed = false;
    var resultData = null;
	var messagePlaque = false;
    //var shouldCallNextStage = false;

    function onGameParametersUpdated() {
        setFontAuto();
        gr.lib._MessagePlaque.on('click', function () {
            hideDialog();
            new GladButton(gr.lib._buttonMessageClose,'buttonClose',{'scaleWhenClick':0.92});
            audio.play('ButtonGeneric');
            // if (shouldCallNextStage) {
            //     msgBus.publish('jLotteryGame.playAgain');
            //     shouldCallNextStage = false;
            // } 
        });
        gr.lib._textClose.setText(loader.i18n.Game.message_close);
        gameUtils.setTextStyle(gr.lib._textClose, {padding:8, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
        gr.lib._Message01_Value.autoFontFitText = true;
        hideDialog();
    }

    function setFontAuto(){
        //gr.lib._Message01_Text.autoFontFitText = true;
        //gr.lib._MessageTry01_Text.autoFontFitText = true;
        gr.lib._Message01_Value.autoFontFitText = true;
        gr.lib._Message02_Text.autoFontFitText = true;
        gr.lib._textClose.autoFontFitText = true;
        for(var i = 0; i < 8; i++){
            gr.lib['_value0'+i].autoFontFitText = true;
        }
    }

    function hideDialog() {
        gr.lib._BG_dim.show(false);
        gr.lib._MessagePlaque.show(false);
    }

    function showDialog() {
        gr.lib._BG_dim.show(true);
        gr.lib._MessagePlaque.show(true);
        gr.lib._Message01_Text.setText('');
        gr.lib._MessageTry01_Text.setText('');
        gr.lib._Message01_Value.setText('');
        gr.lib._Message02_Text.setText('');
        if (resultData.playResult === 'WIN') {
            var msgText = SKBeInstant.config.wagerType === 'BUY'?gr.lib._Message01_Text:gr.lib._MessageTry01_Text;
			var msgTextHere;
			if (SKBeInstant.config.wagerType === 'BUY') {
				msgTextHere = loader.i18n.Game.message_buyWin;
			}else{
				if(Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1){
					msgTextHere = loader.i18n.Game.message_anonymous_tryWin;
				}else{
					msgTextHere = loader.i18n.Game.message_tryWin;
				}
			}
            msgText.updateCurrentStyle({_text:{_lineHeight:50, _token:msgTextHere}});
            gr.lib._Message01_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
            audio.play('BaseMusicLoopTermWin');
        } else {
            gr.lib._Message02_Text.setText(loader.i18n.Game.message_nonWin);
            audio.play('BaseMusicLoopTermLose');
        }
        gameUtils.setTextStyle(gr.lib._Message01_Text, {padding:8, stroke:"#ffbd02", strokeThickness:2});
        gameUtils.setTextStyle(gr.lib._MessageTry01_Text, {padding:8, stroke:"#ffbd02", strokeThickness:2});
        gameUtils.setTextStyle(gr.lib._Message02_Text, {padding:8, stroke:"#ffbd02", strokeThickness:2});
    }

    function onStartUserInteraction(data) {
        //shouldCallNextStage = true;
        resultData = data;
        allFortuneRevealed = false;
        hideDialog();
    }

    function checkAllRevealed() {
        if (allFortuneRevealed) {
            msgBus.publish('jLotteryGame.finishAllSymbolRevealed');          
            msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
                tierPrizeShown: resultData.prizeDivision,
                formattedAmountWonShown: resultData.prizeValue
            });
            msgBus.publish('disableUI');
        }
    }

    function onEnterResultScreenState() {
        //msgBus.publish('enableUI');
        showDialog();
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        hideDialog();
    }
    
    function onRestart(){
        // if (shouldCallNextStage) {
        //     msgBus.publish('jLotteryGame.playAgain');
        //     shouldCallNextStage = false;
        // }
    }

	function onDisableMessagePlaque(){
		messagePlaque = false;
		if(gr.lib._MessagePlaque.pixiContainer.visible){
			messagePlaque = true;
		}
		gr.lib._MessagePlaque.show(false);
	}
	function onEnableMessagePlaque(){
		if(messagePlaque){
			gr.lib._BG_dim.show(true);
			gr.lib._MessagePlaque.show(true);
		}
	}
	
	msgBus.subscribe('disableMessagePlaque', onDisableMessagePlaque);
	msgBus.subscribe('enableMessagePlaque', onEnableMessagePlaque);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('allFortuneRevealed', function () {
        allFortuneRevealed = true;
        checkAllRevealed();
    });
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('restart', hideDialog);
    msgBus.subscribe('restart', onRestart);
    msgBus.subscribe('openTutorial', hideDialog);

    return {};
});