/**
 * @module game/playAnimationController
 * @description 
 */
define([
	'skbJet/componentCRDC/gladRenderer/Tween',
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant'
], function (Tween, msgBus, audio, gr, loader, SKBeInstant) {
    var resultArray;
    var prizeFArray;
    var houseSymbol = {'A':'I', 'B':'II', 'C':'III', 'D':'IV', 'E':'V', 'F':'VI', 'G':'VII', 'H':'VIII'};
    var prizeUpdate;
    var checkList = {'0':[2, 4, 6], '1':[0,3,6], '2':[1,4,7], '3':[2,5,8], '4':[0,4,8], '5':[6,7,8], '6':[3,4,5], '7':[0,1,2]};
    var prizeNumberArray;
    var animationRecord;
    var lightArray;
    var lightListener = [];
    var symbolsListener = [];
    var tListener = [];
    var symbolReveal = 0;
    var revealNum = 0;
    var channelNum = 3;	
	var winChannel=0;
    var symbolChannel = 0;
    var winlineChannel = 0;
    var prizeValueSum = 0;
    var allSymbolRevealed = false;
	
    function resetAll() {
        resultArray = [];
        prizeNumberArray = [];
        lightArray = [];
        prizeUpdate = 0;
        animationRecord = {};
        symbolReveal = 0;
        revealNum = 0;
        winChannel=0;
		symbolChannel = 0;
		winlineChannel = 0;
        allSymbolRevealed = false;
        for (var i = 0; i < 9; i++) {
            gr.lib['_Symbol_0' + i].off('click', symbolsListener[i]);
            gr.lib['_Symbol_0' + i].show(true);
            gr.lib['_Snow_0' + i].show(true);
            gr.lib['_Snow_0' + i].setImage('snow_01');
            gr.lib['_Snow_0' + i].stopPlay('snow');
            gr.lib['_Light_0' + i].show(true);
            gr.lib['_Light_0' + i].stopPlay('light');
            gr.lib['_Symbol_0' + i].revealFlag = false;
            gr.lib['_Light_0' + i].setImage('light_01');
            gr.lib['_Animal_0' + i].setImage(SKBeInstant.getGameOrientation() === 'portrait'?'FuP_0001':'symbolI_0001');
            var animationName = gr.lib['_Animal_0' + i].getImage().substring(0,gr.lib['_Animal_0' + i].getImage().length-5);
            gr.lib['_Animal_0' + i].stopPlay(animationName);
            gr.lib['_Multiple0' + i].show(false);	
            
        }
        resetTween();
        for (i = 0; i < 8; i++) {
            var prizeF = gr.lib['_value0' + i];
            prizeF.setText('');
            prizeF._currentStyle._transform._scale._x = 1;
            prizeF._currentStyle._transform._scale._y = 1;
            checkList[i].winFlag = false;	
            gr.lib['_fortuneBG0' + i].setImage('fortuneP_01');
            gr.lib['_fortuneBG0' + i].stopPlay('fortuneP');
            gr.lib['_fortuneFront0' + i].show(true);
            gr.lib['_star0' + i].show(false);
            gr.lib['_star0' + i].setImage('star_0001');
            gr.lib['_star0' + i].stopPlay('star');
            prizeF.updateCurrentStyle({_text:{_color:'5b0c07'}});
        }
        clearSymTimeout();
        clearTListener();
    }	

    function resetTween(){
        for(var i = 0; i < 9; i++){
            gr.lib['_multiple0' + i + '_0'].updateCurrentStyle({_left:0, _top:0, _opacity:0});
            gr.lib['_multiple0' + i + '_1'].updateCurrentStyle({_left:0, _top:0, _opacity:1});
            if((i%2) === 0) {
                gr.lib['_multiple0' + i + '_2'].updateCurrentStyle({_left:0, _top:0, _opacity:1});
                if(Number(i) === 4) {
                    gr.lib['_multiple0' + i + '_3'].updateCurrentStyle({_left:0, _top:0, _opacity:1});
                } 
            }
        }
    }

    function clearTListener(){
        for(var i = 0; i < tListener.length; i++){
            gr.getTimer().clearTimeout(tListener[i]);
        }
    }

    function clearSymTimeout(){
        for(var i = 0; i < lightListener.length; i++){
            gr.getTimer().clearTimeout(lightListener[i]);
        }
    }
    //select snow sprite random and not repeat snow number before all snows are selected
    function snowLightRandom(){
        if(lightArray.length === 0) {
            lightArray = [0,1,2,3,4,5,6,7,8];	
            for(var i = 0; i < 9; i++){
                if(gr.lib['_Symbol_0' + i].revealFlag) {
                    var p = lightArray.indexOf(i);
                    lightArray.splice(p,1);
                }					    
            }	
        }		
        var selectNum = Math.floor(Math.random()*lightArray.length);
        var lightNumSec = lightArray.splice(selectNum, 1);
        return lightNumSec[0];
    }
    //play snow animation
    function showLightAnimation(){
        var selectNum = snowLightRandom();
        if(selectNum){gr.lib['_Light_0' + selectNum].gotoAndPlay('light',0.3);}       
        if(symbolReveal < 9){lightListener.push(gr.getTimer().setTimeout(showLightAnimation, 1500));}          
        else{clearSymTimeout();}          
    }

    // If a winLine has height light, set it winFlag true
    function winAnimationShow(line, indexLine){
        for(var i = 0; i < checkList[line].length; i++){
            var num = checkList[line][i];
            var symbolSelect = gr.lib['_Symbol_0' + num];
            if(symbolSelect.revealFlag) {
                var animal = gr.lib['_Animal_0' + num];				
                var animationName = animal.getImage().substring(0,animal.getImage().length-5);
                animal.indexLine = indexLine;
                animationRecord[animal.getName()]=[animationName];
            } 
        }
        checkList[line].winFlag = true;
        lightWinAnimal();
    }
    // play win animal animation
    function lightWinAnimal(){
        for(var i in animationRecord){
            gr.lib[i].gotoAndPlay(animationRecord[i], 0.5, true);
        }
    }
    //height light symbol animal when got a winline
    function heightlightFortune(resultArray, flag) {
        for(var i = 0; i < 8; i++){
            var winLine = true;
            var tempArray=[];
            for(var j = 0; j < checkList[i].length; j++){			
                if(!Number(resultArray[checkList[i][j]])) {tempArray.push(checkList[i][j]);} 
            }       
        for(var k = 0; k < tempArray.length; k++){
            if((k+1) < tempArray.length){
                if(resultArray[tempArray[k]] === resultArray[tempArray[k+1]]){continue;}             
                else{
                    winLine = false;
                    break;
                }
            }
        }
        if(winLine){
                var iRevealShow = true;
                if(!gr.lib['_Symbol_0' + checkList[i][0]].revealFlag || !gr.lib['_Symbol_0' + checkList[i][1]].revealFlag || !gr.lib['_Symbol_0' + checkList[i][2]].revealFlag)
                    {iRevealShow = false;}
                if(iRevealShow && !checkList[i].winFlag &&!flag) {					
                    var indexTemp = i;
                    winAnimationShow(indexTemp, i);
                    gr.lib['_fortuneFront0' + i].show(false);
                    gr.lib['_fortuneBG0' + i].gotoAndPlay('fortuneP',0.5,true);
                    gr.lib['_value0' + i].updateCurrentStyle({_text:{_color:'fcf9ab'}});
                    var mvl = Number(showMultipleValue(checkList[i]));
                    var winValue = prizeNumberArray[i]*mvl;
                    if(revealNum === 9){ 
                        allSymbolRevealed = true;
                    }
                    updateWinValue(Number(winValue/100));
                    
                    audio.play('RevealMatch','revealMatch'+winChannel%channelNum);
                    winChannel++;
                }					
            }
        }
    }
    // show multiple number in winline
    function showMultipleValue(array){
        var mvl = 1;
        for(var i = 0; i < array.length; i++){
            if(Number(resultArray[array[i]])){mvl = Number(resultArray[array[i]]);}
        }
        return mvl;
    }

    function setPrizeNumber(data, prizeValue){
        for(var i = 0; i < data.prizeTable.length; i++){
            if(prizeValue === data.prizeTable[i].description){
                prizeValue = data.prizeTable[i].prize;
            }                
        }
        return Number(prizeValue);
    }
    // update prize value when got a multiple symbol
    function prizeMultiple(tp, multiple){
        var index = tp.data._name.charAt(tp.data._name.length-1);
        if(Number(index) === 7){gr.animMap._ValueAnim.play();}
            
        else{gr.animMap['_ValueAnim0' + index].play();}
        
        tp.setText(SKBeInstant.formatCurrency(prizeNumberArray[Number(index)]*multiple).formattedAmount);	
        var starTemp = gr.lib['_star0' + index];    
        gr.lib['_star0' + index].show(true);
        gr.lib['_star0' + index].gotoAndPlay('star', 0.5); 
        gr.lib['_star0' + index].pixiContainer.$sprite.onComplete = function(){
            starTemp.show(false);
        };      
        audio.play('ValueMultiplier');
    }
    // find prize value number corresponding to the winline
    function multipleToValueNum(num){
        var mulValArray =[];
        for(var i = 0; i < 8; i++){
            for(var j = 0; j < checkList[i].length; j++){
                if(Number(num) === checkList[i][j]){mulValArray.push(i);}                 
            }
        }
        return mulValArray;		
    }
    //tween animation:move multiples symbol to corresponding prize value position
    function multipleMove(mulArray,number, duration, resultValue){
        for(var i = 0; i < mulArray.length; i++){		
            var sp = gr.lib['_multiple0' + number + '_' + i];
            var tp = gr.lib['_value0' + mulArray[i]];
            sp.setImage(resultValue + 'x');
            sp.show(true);
            moveForTween(sp, tp, duration, resultValue);        
        }
    }
    //when sp sprite arrive at tp position, disable sp and multiple the prize value
    function moveForTween(sp, tp, duration, resultValue){
        Tween.move(sp,tp,duration,"",{_onComplete:function(){
            sp.show(false);	
            prizeMultiple(tp,Number(resultValue));		
        }
        });
    }
    // set multiples sprite visible flag
    function multipleShow(number, flag){
        if(Number(number)%2){
            gr.lib['_multiple0' + number + '_1'].show(flag);
        } else {
            if(Number(number) === 4) {
                gr.lib['_multiple0' + number + '_1'].show(flag);
                gr.lib['_multiple0' + number + '_2'].show(flag);
                gr.lib['_multiple0' + number + '_3'].show(flag);
            } else {
                gr.lib['_multiple0' + number + '_1'].show(flag);
                gr.lib['_multiple0' + number + '_2'].show(flag);
            }
        }
    }

    function onStartUserInteraction(data) {
        if(!data.scenario){
            msgBus.publish('error', 'Cannot parse server response');
        }
        showLightAnimation();
        allSymbolRevealed = false;
        prizeValueSum = data.prizeValue;
        gr.lib._buttonDim00.show(false);
        resultArray = data.scenario.split('|')[0].split(',');
        prizeFArray = data.scenario.split('|')[1].split(',');    
        //show prize numberName
        for(var j = 0; j < prizeFArray.length; j++){
            var prizeName = gr.lib['_value0' + j];
            var prizeNumber = setPrizeNumber(data,prizeFArray[j]);
            prizeNumberArray.push(prizeNumber);
            prizeName.setText(SKBeInstant.formatCurrency(prizeNumber).formattedAmount);
        }
        //show fortune house reveal result
        function setFortuneRevealAction(fortune) {
            fortune.reveal = function () {
                if (!fortune.revealFlag) {
                    revealNum++;
                    fortune.revealFlag = true;					
                    var name = fortune.data._name;
                    var number = name.substring(name.length-1);
                    var animal = gr.lib['_Animal_0' + number];
                    gr.lib['_Light_0'+number].show(false);
                    gr.lib['_Light_0'+number].stopPlay('light');			
                    var resultValue = resultArray[Number(number)];
                    var isMV = false;
                    if(resultValue.match(/[1-9]/)){
                        animal.setImage(SKBeInstant.getGameOrientation() === 'portrait'?'FuP_0001':'Fu_0001');
                        if(Number(resultValue) > 1){		
                            gr.lib['_Multiple0' + number].show(true);			
                            var mulSec = gr.lib['_multiple0'+number+'_0'];
                            mulSec.setImage(resultValue + 'x');
                            multipleShow(number, false);					
                            var tempArray = multipleToValueNum(number);
                            gr.animMap['_multipleAnim_0' + number]._onComplete = function(){
                                multipleMove(tempArray,number,500,resultValue);
                            };
                            gr.animMap['_multipleAnim_0' + number].play();	
                            isMV = true;
                        }
                        audio.play('Reveal1', 'winReveal' + winlineChannel%channelNum);	
                        winlineChannel++;
                    }else{
                        if(SKBeInstant.getGameOrientation() === 'portrait'){
                            animal.setImage('symbolP' + houseSymbol[resultValue] + '_0001');
                        }else{ 
                            animal.setImage('symbol' + houseSymbol[resultValue] + '_0001');  
                        }                     
                        audio.play('Reveal0', 'symbolReveal' + symbolChannel%channelNum);
                        symbolChannel++;
                    }	
                    gr.lib['_Snow_0' + number].gotoAndPlay('snow',0.4, false);
                    gr.lib['_Snow_0' + number].pixiContainer.$sprite.onComplete = function(){
                        if(isMV){
                            tListener.push(gr.getTimer().setTimeout(resultLight, 1400));
                        }else{
                            tListener.push(gr.getTimer().setTimeout(resultLight, 100));
                        }
                        symbolReveal++;
                        if(symbolReveal === 9){
                            msgBus.publish('allFortuneRevealed');
                        }
                    };
                    if(revealNum === 9){
                        msgBus.publish('disableUI');                     
                    }
                }
            };
            function resultLight(){
                if (data.playResult === 'WIN') {
                    heightlightFortune(resultArray, false);
                }
            }
        }

        function handleRevealAction(symbol, index) {
            var fortune = gr.lib[symbol];
            fortune.revealFlag = false;
            setFortuneRevealAction(fortune);
            symbolsListener[index] = fortune.on('click', fortune.reveal);
            fortune.mouseEnabled = true;
        }

        for (var k = 0; k < 9; k++) {
            handleRevealAction('_Symbol_0' + k, k);
        }
    }

    function updateWinValue(value){           
        prizeUpdate+=value;
        if(prizeUpdate*100 > prizeValueSum || (allSymbolRevealed && prizeUpdate*100 < prizeValueSum)){
            msgBus.publish('jLotteryGame.error',{errorCode:'29000',errorDescriptionSpecific: ' '});
            msgBus.publish('stopRevealAll');
        }
        gr.lib._WinsValue.setText(SKBeInstant.formatCurrency(prizeUpdate*100).formattedAmount);
    }	
	
    function cloneAnimationForGlad(){
        var multipleScale, multipleScaleList,valueAnim, valueAnimList;
        for(var i = 1; i < 9; i++){
            multipleScale = '_multipleAnim_0' + i;
            multipleScaleList = ['_multiple0' + i + '_0'];
            gr.animMap._multipleAnim_00.clone(multipleScaleList, multipleScale);
        }
        for(var j = 0; j< 7; j++){
            valueAnim = '_ValueAnim0' + j;
            valueAnimList = ['_value0' + j];
            gr.animMap._ValueAnim.clone(valueAnimList, valueAnim);
        }
    }

    function onReStartUserInteraction(data) {
        stopAllGladAnim();
        resetAll();
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        resetAll();
        stopAllGladAnim();	
    }

    function updateTextPadding(sp, num){
        sp._currentStyle._text._padding = num;
        sp.pixiContainer.$text.style.padding = num;
    }

    function onGameParametersUpdated(){
        prepareAudio();
        for(var i = 0; i < 8; i++){
            updateTextPadding(gr.lib['_value0' + i], 4);
            gr.lib['_value0' + i].autoFontFitText = true;
        }
        resetAll();  
        cloneAnimationForGlad();  
    }
    
    function stopAllGladAnim() {
        for (var p in gr.animMap) {
            gr.animMap[p].stop();
        }
    }   

    function onStartRevealAll(){
        for(var i = 0; i < 9; i++){
            var fortune = gr.lib['_Symbol_0' + i];
            if(!fortune.revealFlag){
                fortune.off('click',  symbolsListener[i]);
            }
        }
    }
    
    function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('RevealMatch', 'revealMatch' + i);
            audio.stopChannel('revealMatch' + i);
            
            audio.play('Reveal0', 'symbolReveal' + i);
            audio.stopChannel('symbolReveal' + i);
			
            audio.play('Reveal1', 'winReveal' + i);
            audio.stopChannel('winReveal' + i);
        }
    }

    msgBus.subscribe('jLotterySKB.reset', resetAll);
    msgBus.subscribe('restart',resetAll);
    msgBus.subscribe('startRevealAll', onStartRevealAll);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);

    return {};
});