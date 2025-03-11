/**
 * @module gameSizeController
 * @memberof game
 * @description game size...
 * @author Alex Wang
 */
define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
		'skbJet/component/SKBeInstant/SKBeInstant',
		'skbJet/component/deviceCompatibility/windowSize'
	], function(msgBus, gr, SKBeInstant, windowSize){

	function windowResized(){
		//var winW = Number(window.innerWidth);
		//var winH = Number(window.innerHeight);
		var winW = windowSize.getDeviceWidth();
		var winH = windowSize.getDeviceHeight();
		document.documentElement.style.width = winW + 'px';
		document.documentElement.style.height = winH + 'px';
		document.body.style.width = winW + 'px';
		document.body.style.height = winH + 'px';
		SKBeInstant.getGameContainerElem().style.width = winW + 'px';
		SKBeInstant.getGameContainerElem().style.height = winH + 'px';
		gr.fitSize(winW, winH);
	}

	function onAssetsLoadedAndGameReady(){
		var gce = SKBeInstant.getGameContainerElem();
		gr.fitSize(gce.clientWidth, gce.clientHeight);
		if(SKBeInstant.isSKB() || SKBeInstant.config.screenEnvironment === 'device'){
			window.addEventListener('resize',windowResized);
			windowResized();
		}
	}

	msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
	return {};
});