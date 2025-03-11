/**
 * @module game/winUpToController
 * @description WinUpTo control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    '../game/gameUtils'
], function (msgBus, gr, loader, SKBeInstant,gameUtils) {

	function onGameParametersUpdated(){
        gr.lib._winUpToText.setText(loader.i18n.Game.win_up_to);
        gameUtils.setTextStyle(gr.lib._winUpToText, {padding:2, stroke:"#143002", strokeThickness:2, fill:["#83ea5a","#629a10"]});
        gameUtils.setTextStyle(gr.lib._winUpToValue, {padding:2, stroke:"#143002", strokeThickness:4, fill:["#83ea5a","#629a10"]});
    }
	
    function onTicketCostChanged(prizePoint){
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
		for (var i = 0; i < rc.length; i++) {
			if (Number(prizePoint) === Number(rc[i].price)) {
				var ps = rc[i].prizeStructure;
				var maxPrize = 0;
				for (var j = 0; j < ps.length; j++) {
					var prize = Number(ps[j].prize);
					if (maxPrize < prize) {
						maxPrize = prize;
					}
				}
				gr.lib._winUpToValue.setText(SKBeInstant.formatCurrency(maxPrize).formattedAmount);
				gameUtils.setTextStyle(gr.lib._winUpToValue, {fill:["#83ea5a","#629a10"]});
 				return;
			}
		}        
    }
    
    msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

	return {};
});