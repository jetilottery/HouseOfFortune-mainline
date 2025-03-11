/**
 * @module tutorialController
 * @description tutorial control
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
    var tutorialNumber;
    var arrowsLeft;
    var arrowsRight;
    var buttonInfo;
    var buttonClose;
    var tutorialFlag;
    var channelNum = 3;
    var ButtonBetDownChannel = 0, ButtonBetUpChannel = 0;
    var showTutorialAtBeginning = true;
    var mtmJFlag = false;
    var reFlag = false;
    var upFlag = false;
    var downFlag = false;

    function resetAll(){
        initTutorialAnimation();
    }

    function initTutorialAnimation(){
        tutorialNumber = 0;
        gr.lib._Point00.setImage('pointII');
        gr.lib._Text00.show(true);
        gr.lib._Tutorial00.show(true);
        gr.lib._ArrowsLeft.show(false);
        gr.lib._ArrowsLeftInactive.show(true);
        gr.lib._ArrowsRight.show(true);
        gr.lib._ArrowsRightInactive.show(false);
        gr.lib._ArrowsRight.setImage('arrows');
        gr.lib._FuZi.show(false);
        for(var i = 1; i < 3; i++){
            gr.lib['_Point0' + i].setImage('pointI');
            gr.lib['_Tutorial0' + i].show(false);
            gr.lib['_Text0' + i].show(false);
        }
    }
	
	function showOrHideTutorial(flag){
		if(flag){
		    gr.lib._Tutorial.show(true);
			gr.lib._BG_dim_01.show(true);
		} else{
			gr.lib._Tutorial.show(false);
			gr.lib._BG_dim_01.show(false);
		}
	}

    function openHelpPage(){
        if(tutorialFlag){
            if(downFlag){return;}
            tutorialFlag = false;
            upFlag = true;
            gr.animMap._TutorialAnim.play();
            gr.animMap._TutorialAnim._onComplete = function(){
                upFlag = false;
            };
			gr.lib._buttonInfo.show(false);
			msgBus.publish("disableMessagePlaque");
			showOrHideTutorial(true);
            msgBus.publish('openTutorial');
        }	
    }

    function closeHelpPage(){
        if(!tutorialFlag){
            if(upFlag){return;}
            tutorialFlag = true;
            gr.animMap._TutorialAnimBack._onComplete = function(){
                initTutorialAnimation();
                msgBus.publish('closeTutorial');
				msgBus.publish("enableMessagePlaque");
				showOrHideTutorial(false);
				gr.lib._buttonInfo.show(true);
                downFlag = false;
            };	
            downFlag = true;
            gr.animMap._TutorialAnimBack.play();	
        }    
    }

    function onGameParametersUpdated(){	
        gr.lib._versionText.autoFontFitText = true;
        gr.lib._versionText.setText(window._cacheFlag.gameVersion);
        prepareAudio();
        tutorialFlag = false;	
        setFontAuto();
        gr.lib._buttonTextClose.setText(loader.i18n.Game.button_close);
        gr.lib._gamePlay.setText(loader.i18n.Game.help_instruction);
        gr.lib._Text00.setText(loader.i18n.Game.text_00);
        gameUtils.setTextStyle(gr.lib._buttonTextClose,{padding:2, dropShadow:true,dropShadowColor:'#000000', dropShadowDistance:2.5});
        buttonInfo = new GladButton(gr.lib._buttonInfo, 'buttonInfo');
        buttonClose = new GladButton(gr.lib._buttonClose, 'buttonClose',{'scaleWhenClick':0.92});
        buttonInfo.click(function(){
            openHelpPage();
            audio.play("ButtonGeneric");	
        });
        buttonClose.click(function(){
            closeHelpPage();
            audio.play("ButtonGeneric");
        });
        gr.lib._Tutorial.on('click', function(event){
            event.stopPropagation();
        });
        gr.lib._BG_dim_01.on('click', function(event){
            event.stopPropagation();
        });
        arrowsLeft = new GladButton(gr.lib._ArrowsLeft, 'arrows');
        arrowsRight = new GladButton(gr.lib._ArrowsRight, 'arrows');      
        gr.lib._Text01.updateCurrentStyle({_text:{_lineHeight:30}});
        if(SKBeInstant.getGameOrientation() === 'landscape'){
            gr.lib._Text02.updateCurrentStyle({_text:{_lineHeight:20}});
        }else{
            gr.lib._Text02.updateCurrentStyle({_text:{_lineHeight:30}});
        }
        gameUtils.setTextStyle(gr.lib._buttonTextClose,{padding:8});
        gameUtils.setTextStyle(gr.lib._gamePlay,{padding:8, stroke:"#ffbd02", strokeThickness:2});
        gr.lib._Text01.setText(SKBeInstant.getGameOrientation() === 'portrait'?loader.i18n.Game.text_01_portrait:loader.i18n.Game.text_01);
        gr.lib._Text02.setText(SKBeInstant.getGameOrientation() === 'portrait'?loader.i18n.Game.text_02_portrait:loader.i18n.Game.text_02);
        gameUtils.setTextStyle(gr.lib._Text00,{padding:8});
        gameUtils.setTextStyle(gr.lib._Text01,{padding:8});
        gameUtils.setTextStyle(gr.lib._Text02,{padding:8});
        resetAll();
		showOrHideTutorial(false);
        if(SKBeInstant.config.customBehavior){
             if(SKBeInstant.config.customBehavior.showTutorialAtBeginning === false){
                showTutorialAtBeginning = false;
                buttonInfo.show(true);
                showOrHideTutorial(false);
            }
        }
        init();	        
    }

    function setFontAuto(){
        gr.lib._gamePlay.autoFontFitText = true;
        gr.lib._buttonTextClose.autoFontFitText = true;
    }

    function pointShow(index){
        for(var i = 0; i < 3; i++){
            if(index === i) {
                gr.lib['_Point0' + i].setImage('pointII');
                gr.lib['_Tutorial0' + i].show(true);
                gr.lib['_Text0' + i].show(true);
                if(i === 1){
                    gr.lib._Tutorial01.gotoAndPlay('tutorialII',0.01,true);
                }
            } else {
                gr.lib['_Point0' + i].setImage('pointI');
                gr.lib['_Tutorial0' + i].show(false);
                gr.lib['_Text0' + i].show(false);
            }		    
        }
        if(index === 2){
            gr.lib._FuZi.show(true);
        }else{
            gr.lib._FuZi.show(false);
        }
    }

    function arrowsSelect(tutorialNumber){
        pointShow(tutorialNumber);
        if(tutorialNumber === 0){
            gr.lib._ArrowsLeft.show(false);
            gr.lib._ArrowsLeftInactive.show(true);
            gr.lib._ArrowsRight.show(true);
            gr.lib._ArrowsRightInactive.show(false);
        } else if(tutorialNumber === 2) {
            gr.lib._ArrowsLeft.show(true);
            gr.lib._ArrowsLeftInactive.show(false);
            gr.lib._ArrowsRight.show(false);
            gr.lib._ArrowsRightInactive.show(true);
        } else{
            gr.lib._ArrowsLeft.show(true);
            gr.lib._ArrowsLeftInactive.show(false);
            gr.lib._ArrowsRight.show(true);
            gr.lib._ArrowsRightInactive.show(false);
        }     
    }

    function init(){
        arrowsLeft.click(function(){
            if(tutorialNumber > 0){	
                tutorialNumber--;
            }	
            arrowsSelect(tutorialNumber);	
            audio.play('ButtonGeneric', 'ButtonBetUp'+ ButtonBetUpChannel%channelNum);	
            ButtonBetUpChannel++;
        });
        arrowsRight.click(function(){	
            if(tutorialNumber < 2){
                tutorialNumber++;
            }	
            arrowsSelect(tutorialNumber);	
            audio.play('ButtonGeneric', 'ButtonBetDown'+ ButtonBetDownChannel%channelNum);	
        });
    }
	
	function onStartUserInteraction(){
        ButtonBetDownChannel = 0;
        ButtonBetUpChannel = 0;
		tutorialFlag = true;	
        showOrHideTutorial(false);	
        gr.lib._buttonInfo.show(true);	
        if(SKBeInstant.config.gameType === 'ticketReady'&& !mtmJFlag) {
            tutorialFlag = false;            
            if(showTutorialAtBeginning){
                showOrHideTutorial(true);    
                gr.lib._buttonInfo.show(false);        
            }else{
                msgBus.publish('closeTutorial');
            }
        } 	
	}
	
	function onReStartUserInteraction(){
	    showOrHideTutorial(false);
		tutorialFlag = true;	
		gr.lib._buttonInfo.show(true);
	}

    function onReInitialize() {
		if(reFlag) {
            reFlag = false;			
			resetAll();
            if(showTutorialAtBeginning){
                gr.getTimer().setTimeout(openHelpPage,300); 
            } else{
                msgBus.publish('closeTutorial');
            }
		} else {
            gr.lib._buttonInfo.show(true);   
        }                  
    }

	function onInitial(){
        if(showTutorialAtBeginning){
            showOrHideTutorial(true);
            msgBus.publish('openTutorial');       
        }else{
            msgBus.publish('closeTutorial');
        }		      
    }

    function onDisableUI(){
        gr.lib._buttonInfo.show(false);
    }

    function onEnableUI(){
        gr.lib._buttonInfo.show(true);
    }
    
    function onEnterResultScreenState() {
        gr.getTimer().setTimeout(function () {
            gr.lib._buttonInfo.show(true);
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
	}
    
    function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('ButtonGeneric', 'ButtonBetDown' + i);
            audio.stopChannel('ButtonBetDown' + i);
            
            audio.play('ButtonGeneric', 'ButtonBetUp' + i);
            audio.stopChannel('ButtonBetUp' + i);
        }
    }
    
    function onPlayerWantsToMoveToMoney(){
        mtmJFlag = true;
        reFlag = true;
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotterySKB.reset', function(){
        resetAll();
        onEnableUI();
    });
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoney);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.initialize', onInitial);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('openTutorial', onDisableUI);
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('closeTutorial', onEnableUI);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);

    return{};
});