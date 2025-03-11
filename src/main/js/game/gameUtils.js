define(function(){
	
	function setTextStyle(Sprite, style){
		for(var key in style){
			Sprite.pixiContainer.$text.style[key] = style[key];
		}
	}
	
	function setText(Sprite, text){
		Sprite.pixiContainer.$text.text = text;
	}
    function fixMeter(gr) {
		var balanceText = gr.lib._BalanceText;
        var balanceValue = gr.lib._BalanceValue;
        var meterDivision0 = gr.lib._meterDivision0;
        var ticketCostMeterText = gr.lib._TicketCostText01;
        var ticketCostMeterValue = gr.lib._TicketCostValue01;
        var meterDivision1 = gr.lib._meterDivision1;
        var winsText = gr.lib._WinsText;
        var winsValue = gr.lib._WinsValue;

        var len = gr.lib._Meters._currentStyle._width;
		var temp, balanceLeft;
        var originFontSize = balanceText.originFontSize;
        if (balanceText.pixiContainer.visible) {
            balanceText.updateCurrentStyle({_font:{_size:originFontSize}});
            balanceValue.updateCurrentStyle({_font:{_size:originFontSize}});
            ticketCostMeterText.updateCurrentStyle({_font:{_size:originFontSize}});
            ticketCostMeterValue.updateCurrentStyle({_font:{_size:originFontSize}});
            winsText.updateCurrentStyle({_font:{_size:originFontSize}});
            winsValue.updateCurrentStyle({_font:{_size:originFontSize}});
			temp = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2;
            balanceLeft = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2;
            balanceLeft = balanceLeft - meterDivision0.pixiContainer.$text.width - balanceValue.pixiContainer.$text.width - balanceText.pixiContainer.$text.width;
            if(temp >= 10){
                if(balanceLeft >= 10){ //ticket cost in center
                    ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                    meterDivision0.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left - meterDivision0.pixiContainer.$text.width)});
                    balanceValue.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left - balanceValue.pixiContainer.$text.width)});
                    balanceText.updateCurrentStyle({'_left': (balanceValue._currentStyle._left - balanceText.pixiContainer.$text.width)});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                    winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});
                }else{ //content in center
                    balanceText.updateCurrentStyle({'_left': temp});
                    balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width)});
                    meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width)});
                    ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width)});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                    winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});
                }
            }else{ //content in center and need decrease font size
                var left = temp;
                for(var fsize = Number(originFontSize-1);fsize>=1 && left < 6;fsize--){
                    balanceText.updateCurrentStyle({_font:{_size:fsize}});
                    balanceValue.updateCurrentStyle({_font:{_size:fsize}});
                    ticketCostMeterText.updateCurrentStyle({_font:{_size:fsize}});
                    ticketCostMeterValue.updateCurrentStyle({_font:{_size:fsize}});
                    winsText.updateCurrentStyle({_font:{_size:fsize}});
                    winsValue.updateCurrentStyle({_font:{_size:fsize}});
                    left = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2;
                }
                balanceText.updateCurrentStyle({'_left': left});
                balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width)});
                meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width)});
                ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width)});
                ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
                winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});                
            }
        } else {
            ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2});
            ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
            meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
            winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
            winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});
		}
    }
	/*
	 * hotSpot {Object}
	 */
	function judgeHotSpot(hotSpot, tarPoint){
		//linear function : y = kx + b
		// function linearCalX(sp,ep,y){
		// 	return (y * (ep.x - sp.x) + sp.x * ep.y - ep.x * sp.y)/(ep.y - sp.y);
		// }
		function linearCalY(sp,ep,x){
			return (x * (ep.y - sp.y) - sp.x * ep.y + ep.x * sp.y)/(ep.x - sp.x);
		}
		function getAdjacentCouplePoints(tarPoint){
			var couplePointsX = [];
			var curIdx, nextIdx;
			for(var i = 0; i < hotSpot.length; i++){
				curIdx = i;
				nextIdx = (i + 1)%hotSpot.length;
				if(hotSpot[curIdx].x >= tarPoint.x && tarPoint.x >= hotSpot[nextIdx].x){
					couplePointsX.push({sp: hotSpot[nextIdx],ep: hotSpot[curIdx]});
				}else if(hotSpot[curIdx].x <= tarPoint.x && tarPoint.x <= hotSpot[nextIdx].x){
					couplePointsX.push({sp: hotSpot[curIdx],ep: hotSpot[nextIdx]});
				}
			}
			return couplePointsX;
		}
		var cpPoints = getAdjacentCouplePoints(tarPoint);
		var intersectionsAbove = [];
		var intersectionsBelow = [];
		var intersection;
		for(var i = 0; i < cpPoints.length; i++){
			intersection = linearCalY(cpPoints[i].sp, cpPoints[i].ep, tarPoint.x);
			if(intersection < tarPoint.y){
				intersectionsAbove.push(intersection);
			}else if(intersection > tarPoint.y){
				intersectionsBelow.push(intersection);
			}
		}
		if(intersectionsAbove.length % 2 === 0 || intersectionsBelow.length % 2 === 0){
			return false;
		}else{
			return true;
		}
	}
    function fixTicketSelect(gr , prizePointList , normalNumber) {
        var ticketSelect = gr.lib._ticketCostLevelIcon_0.parent;
		var gameWidth = gr.getPixiRenderer().view.width;
		var ticketSelectWidth = ticketSelect._currentStyle._width;
		var ticketSelectLeft = ticketSelect._currentStyle._left || 0;
		if(gameWidth !== ticketSelectWidth || ticketSelectLeft !== 0){
			ticketSelectWidth = gameWidth - ticketSelectLeft * 2;
		}
        var iconNumber = prizePointList.length;
        var originLeft = gr.lib._ticketCostLevelIcon_0._currentStyle._left;
        if(iconNumber === normalNumber){
            return;
        }else{
            var scale = gr.lib._ticketCostLevelIcon_0._currentStyle._transform._scale._x;
            var lastTicketIcon = gr.lib["_ticketCostLevelIcon_" + (iconNumber - 1)];
			var iconWidth = lastTicketIcon._currentStyle._width * scale;
            var len = lastTicketIcon._currentStyle._left + iconWidth - gr.lib._ticketCostLevelIcon_0._currentStyle._left;
            var currentLeft = (ticketSelectWidth - len)/2;
            var diffValue = currentLeft - originLeft - iconWidth;
            for(var i = 0; i < iconNumber;i++){ 
                gr.lib["_ticketCostLevelIcon_" + i].updateCurrentStyle({"_left":gr.lib["_ticketCostLevelIcon_" + i]._currentStyle._left + diffValue});
            }
        }
    }
	return{
		setTextStyle:setTextStyle,
		setText:setText,
		fixMeter: fixMeter,
		judgeHotSpot: judgeHotSpot,
		fixTicketSelect: fixTicketSelect
	};
});

