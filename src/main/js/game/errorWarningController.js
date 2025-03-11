/**
 * @module errorWarningController
 * @memberof game
 * @description
 * @author Alex Wang
 */
define([
	    'skbJet/componentCRDC/gladRenderer/gladButton',
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/audioPlayer/AudioPlayerProxy',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
		'skbJet/component/pixiResourceLoader/pixiResourceLoader',
		'skbJet/component/SKBeInstant/SKBeInstant',
		'../game/gameUtils'
	], function(GladButton, msgBus, audio, gr, loader, SKBeInstant, gameUtils){
        var warningExit, warningContinue, errorExit;
		var inGame = false;
		var warnMessage = null;
		var showWarn = false;
		var showError = false;
		var shadowStyle = {padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5};
		var scaleType;

		function getHelpBGUrl(){
			return SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/images/'+SKBeInstant.getGameOrientation()+'HelpBG.jpg';
		}
		
		function getGameBGUrl(){
			return SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/images/'+SKBeInstant.getGameOrientation()+'BG.jpg';
		}
		
		function format(/* string, placeholder values... */) {
			var args = Array.prototype.slice.call(arguments),
					s = arguments[0],
					i = args.length - 1;

			while (i--) {
				s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i + 1]);
			}
			return s;
		}

		function onGameParametersUpdated(){
			scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
			warningExit = new GladButton(gr.lib._warningExitButton,'buttonPlay',scaleType);
			warningContinue = new GladButton(gr.lib._warningContinueButton,'buttonPlay',scaleType);
			errorExit = new GladButton(gr.lib._errorExitButton,'buttonPlay',{'scaleWhenClick':0.92});
			gameUtils.setTextStyle(gr.lib._warningContinueText,shadowStyle);
			gameUtils.setTextStyle(gr.lib._warningExitText,shadowStyle);
			gameUtils.setTextStyle(gr.lib._warningTitle,shadowStyle);
			gameUtils.setTextStyle(gr.lib._warningText,shadowStyle);
			gr.lib._warningExitText.setText(loader.i18n.Game.warning_button_exitGame);
			gr.lib._warningContinueText.setText(loader.i18n.Game.warning_button_continue);
		
			gr.lib._warningContinueButton.on('click', closeErrorWarn);
            gr.lib._warningExitButton.on('click',function(){
				msgBus.publish('jLotteryGame.playerWantsToExit');
				audio.play('ButtonGeneric',0);
			});
			if(gr.lib._winBoxError){
				gr.lib._winBoxError.show(false);
			}
			gameUtils.setTextStyle(gr.lib._errorExitText, shadowStyle);
			gameUtils.setTextStyle(gr.lib._errorTitle, shadowStyle);
			gameUtils.setTextStyle(gr.lib._errorText, shadowStyle);
			gr.lib._errorExitText.setText(loader.i18n.Game.error_button_exit);
		    gr.lib._errorTitle.setText(loader.i18n.Game.error_title);
            gr.lib._errorExitButton.on('click', function(){
				msgBus.publish('jLotteryGame.playerWantsToExit');
				audio.play('ButtonGeneric',0);
			});
		}

		function onWarn(warning){
			SKBeInstant.getGameContainerElem().style.backgroundImage = format('url({0}) center / cover no-repeat', getHelpBGUrl());							
		    gr.lib._warningText.updateCurrentStyle({_text:{_lineHeight:40, _token:warning.warningMessage}});
			warnPageShow(true);			
		}

		function closeErrorWarn(){
			showError = false;
			gr.lib._GameScene.show(true);
			gr.lib._ErrorScene.show(false);
		    SKBeInstant.getGameContainerElem().style.backgroundImage = format('url({0}) center / cover no-repeat', getGameBGUrl());            
            audio.play('ButtonGeneric');
        }

		function onError(error){
			showError = true;
            audio.muteAll(true);      
			 if (error.errorCode === '29000') {
				if (gr.lib._winBoxError) {
					gr.lib._winBoxError.show(true);
				}
				gr.lib._winBoxErrorText.setText(error.errorCode);
			} else {
				gr.lib._errorTitle.show(true);
				gr.lib._buttonInfo.show(false);
				gr.lib._warningText.show(false);
				gr.lib._errorText.show(true);
				gr.lib._errorText.updateCurrentStyle({_text:{_lineHeight:40, _token:error.errorCode+":"+ error.errorDescriptionSpecific+"\n"+ error.errorDescriptionGeneric}});				
			    gr.lib._warningExitButton.show(false);
				gr.lib._warningContinueButton.show(false);
				gr.lib._errorExitButton.show(true);
				SKBeInstant.getGameContainerElem().style.backgroundImage = format('url({0}) center / cover no-repeat', getHelpBGUrl());		    
			}   
            warnPageShow(false);
			msgBus.publish('openTutorial');
		
			//destroy if error code is 00000
			//this is a carry-over from jLottery1 where if the game is closed via the confirm prompt
			//rather than the exit button
			if (error.errorCode === '00000' || error.errorCode === '66605') {
				if (document.getElementById(SKBeInstant.config.targetDivId)) {
					document.getElementById(SKBeInstant.config.targetDivId).innerHTML = "";
					document.getElementById(SKBeInstant.config.targetDivId).style.background = '';
					document.getElementById(SKBeInstant.config.targetDivId).style.backgroundSize = '';
					document.getElementById(SKBeInstant.config.targetDivId).style.webkitUserSelect = '';
					document.getElementById(SKBeInstant.config.targetDivId).style.webkitTapHighlightColor = '';
				}
				//clear require cache
				if (window.loadedRequireArray) {
					for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
						requirejs.undef(window.loadedRequireArray[i]);
					}
				}
			}	
		}

		function warnPageShow(flag){
			gr.lib._GameScene.show(false);
			gr.lib._ErrorScene.show(true);
			gr.lib._warningTitle.show(flag);
			warningExit.show(flag);			
			warningContinue.show(flag);
			errorExit.show(!flag);
			gr.lib._errorTitle.show(!flag); 

		}

		function onEnterResultScreenState(){
            inGame = false;
            if (showWarn) {
                showWarn = false;
                gr.getTimer().setTimeout(function () {
                    onWarn(warnMessage);
                }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
            }
        }

		function onStartUserInteraction(){
			inGame = true;//gameType is tickerReady
		}

		function onReStartUserInteraction(){
			onStartUserInteraction();
		}

		msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
		msgBus.subscribe('jLottery.reInitialize', function(){
			inGame = false;
		});	
		msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
		msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
		msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
		msgBus.subscribe('jLottery.error', onError);
		msgBus.subscribe('buyOrTryHaveClicked', function(){
			inGame = true;
		});
		msgBus.subscribe('jLottery.playingSessionTimeoutWarning', function(warning){
			if(SKBeInstant.config.jLotteryPhase === 1 || showError){
                return;
            }
            if(inGame){
                warnMessage = warning;
                showWarn = true;
            }else{
                onWarn(warning);                
            }
        });

	return {};
});