/**
 * @module game/meters
 * @description meters control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/component/currencyHelper/currencyHelper',
	'../game/gameUtils'
], function (msgBus, gr, loader, SKBeInstant,currencyHelper, gameUtils) {

    var resultData = null;
    var MTMReinitial = false;

    function onStartUserInteraction(data) {
        resultData = data;       
    }

    function onEnterResultScreenState() {
        if(resultData.prizeValue > 0 || SKBeInstant.isWLA()){
            gr.lib._WinsValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
            gameUtils.fixMeter(gr);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        if (MTMReinitial && SKBeInstant.config.balanceDisplayInGame) {
            gr.lib._BalanceText.show(true);
            gr.lib._BalanceValue.show(true);
            gr.lib._meterDivision0.show(true);
        }
        gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }

    function onUpdateBalance(data){
        if (SKBeInstant.config.balanceDisplayInGame) {
            gr.lib._BalanceValue.setText(data.formattedBalance);
            gameUtils.fixMeter(gr);
        }
    }

    function onGameParametersUpdated(){
        if(SKBeInstant.config.balanceDisplayInGame === false || (SKBeInstant.config.wagerType === 'TRY' && (!SKBeInstant.isSKB() || Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1))){
            gr.lib._BalanceText.show(false);
            gr.lib._BalanceValue.show(false);
            gr.lib._meterDivision0.show(false);
        }
        gameUtils.setTextStyle(gr.lib._BalanceText, {padding:2});
        gameUtils.setTextStyle(gr.lib._BalanceValue, {padding:2});
        gameUtils.setTextStyle(gr.lib._WinsText, {padding:2});
        gameUtils.setTextStyle(gr.lib._WinsValue, {padding:2});	  
        if(!SKBeInstant.isSKB()){
           gr.lib._BalanceValue.setText('');
        }
        if(SKBeInstant.config.locale === 'en_us'){
            gr.lib._Logo.setImage('logoTranslate');
        }
        if(SKBeInstant.config.locale === 'zh_cn'){
            gr.lib._Logo.setImage('logo');
        }
        gr.lib._BalanceText.setText(loader.i18n.Game.balance);    
        gr.lib._BalanceText.originFontSize = gr.lib._BalanceText.pixiContainer.$text.style.fontSize;
        gr.lib._meterDivision0.setText(loader.i18n.Game.meter_division);
        gr.lib._meterDivision1.setText(loader.i18n.Game.meter_division);
        gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }

    function onTicketCostChanged(prizePoint){
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._WinsText.setText(loader.i18n.Game.wins);
            gr.lib._TicketCostValue01.setText(SKBeInstant.formatCurrency(prizePoint).formattedAmount);
        } else {
            gr.lib._WinsText.setText(loader.i18n.Game.wins_demo);
            gr.lib._TicketCostValue01.setText(loader.i18n.Game.demo + SKBeInstant.formatCurrency(prizePoint).formattedAmount);
        }
        gameUtils.fixMeter(gr);
    }

    function onRestart(){
        gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }

    function onBeforeShowStage(data){
		gr.lib._BalanceValue.setText(currencyHelper.formatBalance(data.response.Balances["@totalBalance"]));
        gameUtils.fixMeter(gr);
		gr.forceRender();
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
    msgBus.subscribe('restart', onRestart);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',function(){
        MTMReinitial = true;
    });
    msgBus.subscribe('jLotteryGame.error', function(){
        gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    });

    return {};
});