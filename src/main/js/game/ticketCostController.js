/**
 * @module game/ticketCost
 * @description ticket cost meter control
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
    var _currentPrizePoint = null;
    var ticketIcon, ticketIconObj = null;
    var prizePointList;
    var arrowPlusGlad, arrowMinusGlad;
    var ticketPrice = 7;
    var channelNum = 3;
    var ButtonBetUpChannel = 0;
    var ButtonBetDownChannel = 0;
    var reFlag = false;
    
    function registerControl() {
        var formattedPrizeList = [];
        var strPrizeList = [];
        for (var i = 0; i < prizePointList.length; i++) {
            formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
            strPrizeList.push(prizePointList[i] + '');
        }        
		var priceText, stakeText;
        if(SKBeInstant.isWLA()){
            priceText = loader.i18n.MenuCommand.WLA.price;
            stakeText = loader.i18n.MenuCommand.WLA.stake;
        }else{
            priceText = loader.i18n.MenuCommand.Commercial.price;
            stakeText = loader.i18n.MenuCommand.Commercial.stake;            
        }
        msgBus.publish("jLotteryGame.registerControl", [{
			name: 'price',
			text: priceText,
            type: 'list',
            enabled: 1,
            valueText: formattedPrizeList,
            values: strPrizeList,
            value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
        }]);
		msgBus.publish("jLotteryGame.registerControl", [{
            name: 'stake',
            text: stakeText,
            type: 'stake',
            enabled: 0,
            valueText: '0',
            value: 0
        }]);
    }
    
    function gameControlChanged(value) {
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'stake',
            event: 'change',
            params: [(SKBeInstant.formatCurrency(value).amount)/100, SKBeInstant.formatCurrency(value).formattedAmount]
        });
		msgBus.publish("jLotteryGame.onGameControlChanged",{
			name: 'price',
			event: 'change',
			params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
		});
	}
    
    function onConsoleControlChanged(data){
        if(!data.value) {return;}
        if (data.option === 'price') {
            setTicketCostValue(Number(data.value));
            msgBus.publish("jLotteryGame.onGameControlChanged", {
			name: 'stake',
			event: 'change',
			params: [(SKBeInstant.formatCurrency(data.value).amount)/100, SKBeInstant.formatCurrency(data.value).formattedAmount]
		    });
        }
    }

    function onGameParametersUpdated() {
        setFontAuto();
        prepareAudio();
        gr.lib._TicketCostText.setText(loader.i18n.Game.wager);
        gr.lib._TicketCostText01.setText(loader.i18n.Game.wager01);
        //Init avaliable prize point list
        prizePointList = [];
        ticketIcon = {};
        for (var i = 0; i < SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length; i++) {
            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizePointList.push(price);
            ticketIcon[price] = "_ticketCostLevelIcon_" + i;
            gr.lib["_ticketCostLevelIcon_" + i].setImage('CostI');
        }   
        registerControl();
        arrowPlusGlad = new GladButton(gr.lib._arrowPlus, 'arrowPlus');
        arrowPlusGlad.click(increaseTicketCost);
        arrowMinusGlad = new GladButton(gr.lib._arrowMinus, 'arrowMinus');
        arrowMinusGlad.click(decreaseTicketCost);
        gameUtils.setTextStyle(gr.lib._TicketCostText,{padding:8});
        gameUtils.setTextStyle(gr.lib._TicketCostText01,{padding:8});
        gameUtils.setTextStyle(gr.lib._TicketCostValue,{padding:8});
        gameUtils.setTextStyle(gr.lib._TicketCostValue01,{padding:8});
        if(prizePointList.length <= 1){
			arrowPlusGlad.show(false);
		    arrowMinusGlad.show(false);
			for(i = 0; i < ticketPrice; i++){
				gr.lib["_ticketCostLevelIcon_" + i].show(false);
			}
		}else{
			arrowPlusGlad.show(true);
		    arrowMinusGlad.show(true);
			for(i = 0;i < ticketPrice;i++){
				if(i < prizePointList.length){
					gr.lib["_ticketCostLevelIcon_" + i].show(true);
				}else{
					gr.lib["_ticketCostLevelIcon_" + i].show(false);
				}
			}
			gameUtils.fixTicketSelect(gr , prizePointList , ticketPrice);
			arrowPlusGlad.click(increaseTicketCost);
			arrowMinusGlad.click(decreaseTicketCost);
		}
        setTicketCostValue(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
        gameControlChanged(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
    }

    function setFontAuto(){
        gr.lib._TicketCostValue.autoFontFitText = true;
        gr.lib._TicketCostText.autoFontFitText = true;
    }

    function setTicketCostValue(prizePoint) {
        var index = prizePointList.indexOf(prizePoint);
        if (index < 0) {
            msgBus.publish('error', 'Invalide prize point ' + prizePoint);
            return;
        }
        if (index === 0) {
            arrowMinusGlad.enable(false);
        } else {
            arrowMinusGlad.enable(true);
        }
        if (index === (prizePointList.length - 1)) {
            arrowPlusGlad.enable(false);
        } else {
            arrowPlusGlad.enable(true);
        }
        var valueString = SKBeInstant.formatCurrency(prizePoint).formattedAmount;
        var valueString01 = valueString;
        if(SKBeInstant.config.wagerType === 'TRY') {
            valueString01 = loader.i18n.Game.demo + valueString;
        }
        gr.lib._TicketCostValue.setText(valueString01);
        gr.lib._TicketCostValue01.setText(valueString01);
         if (ticketIconObj) {
            ticketIconObj.setImage('CostI');
        }
        ticketIconObj = gr.lib[ticketIcon[prizePoint]];
        ticketIconObj.setImage('CostII');
        _currentPrizePoint = prizePoint;
        //changeCost(index);
        msgBus.publish('ticketCostChanged', prizePoint);
    }
    
    function setTicketCostValueWithNotify(prizePoint){
        setTicketCostValue(prizePoint);
        gameControlChanged(prizePoint);
    }

    function increaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index++;
        setTicketCostValue(prizePointList[index]);
        gameControlChanged(prizePointList[index]);
        audio.play('ButtonGeneric', 'ButtonBetUp' + (ButtonBetUpChannel%channelNum));
        ButtonBetUpChannel++;
    }

    function decreaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index--;
        setTicketCostValue(prizePointList[index]);
        gameControlChanged(prizePointList[index]);
        audio.play('ButtonGeneric', 'ButtonBetDown' + (ButtonBetDownChannel % channelNum));
        ButtonBetDownChannel++;
    }

    function showHideMeterDim(flag){
        gr.lib._ticketCost.show(flag);
    }

    function resetAll() {
        setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
    }
    
    function onReset(){
        enableConsole();      
        if(_currentPrizePoint){
            setTicketCostValueWithNotify(_currentPrizePoint);
        }else{
            setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
        }
        showHideMeterDim(true);
    }

    function onInitialize() {
        showHideMeterDim(true);
    }

    function onReInitialize() {
        if(reFlag){
            resetAll();                     
            reFlag = false;
            enableConsole();
            showHideMeterDim(true);
        } else {
            onReset();
        }
            
        gr.lib._TicketCostText.setText(loader.i18n.Game.wager);
        gr.lib._buttonDim00.show(true);        
    }

    function onStartUserInteraction(data) {
        ButtonBetUpChannel = 0;
        ButtonBetDownChannel = 0;
        disableConsole();
        showHideMeterDim(false);
        arrowPlusGlad.enable(false);
        arrowMinusGlad.enable(false);
        if (data.price) {
            _currentPrizePoint = data.price;
            var valueString = SKBeInstant.formatCurrency(_currentPrizePoint).formattedAmount;
            var valueString01 = valueString;
            if(SKBeInstant.config.wagerType === 'TRY') {
                valueString01 = loader.i18n.Game.demo + SKBeInstant.formatCurrency(_currentPrizePoint).formattedAmount;
            }
            gr.lib._TicketCostValue.setText(valueString01);
            gr.lib._TicketCostValue01.setText(valueString01);
        }
		setTicketCostValue(_currentPrizePoint);
		gameControlChanged(_currentPrizePoint);
        msgBus.publish('ticketCostChanged', _currentPrizePoint);
    }

    function onEnterResultScreenState() {
        enableConsole();
        if (SKBeInstant.config.jLotteryPhase === 2) {
            setTimeout(function () {
                setTicketCostValue(_currentPrizePoint);
                gameControlChanged(_currentPrizePoint);			    
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onPlayerBuyOrTry() {
        arrowPlusGlad.enable(false);
        arrowMinusGlad.enable(false);
    }
    
    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[1]}
        });
    } 
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[0]}
        });
    }
	
	function onOpenTutorial(){
        if(gr.lib._ticketCost.pixiContainer.visible){
		    gr.lib._ticketCost.updateCurrentStyle({_opacity:0});
        }
	}

	function onCloseTutorial(){
		gr.lib._ticketCost.updateCurrentStyle({_opacity:1});
	}
    
    function onRestart(){
        enableConsole();
        setTicketCostValueWithNotify(_currentPrizePoint);        
        gr.lib._ticketCost.show(true);
    }
    
    function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('ButtonGeneric', 'ButtonBetUp' + i);
            audio.stopChannel('ButtonBetUp' + i);
            
            audio.play('ButtonGeneric', 'ButtonBetDown' + i);
            audio.stopChannel('ButtonBetDown' + i);
        }
    }

    function onPlayerWantsToMoveToMoney(){
        reFlag = true;
    }
    
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoney);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('openTutorial', onOpenTutorial);
	msgBus.subscribe('closeTutorial', onCloseTutorial);
    msgBus.subscribe('playerBuyOrTry', onPlayerBuyOrTry);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('restart', onRestart);
    return {};
});