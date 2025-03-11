/**
 * @module paytableHelpController
 * @description
 */
define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
        'skbJet/component/pixiResourceLoader/pixiResourceLoader',
		'skbJet/component/audioPlayer/AudioPlayerProxy',
        'skbJet/component/SKBeInstant/SKBeInstant'
	], function(msgBus, gr, loader, audio, SKBeInstant){

    var paytableText, howToPlayText;
    function onSystemInit(){
        var articles=document.getElementsByTagName('article');
        for(var i=0;i<articles.length;i++){
            articles[i].addEventListener('mousedown',preventDefault,false);
        }
        document.addEventListener('mousemove',preventDefault,false);
	}

    function preventDefault(e){
        var ev=e||window.event;
        ev.returnValue=false;
        ev.preventDefault();
    }

    function onGameInit(){
        registerConsole();   
    }

    function onBeforeShowStage(){        
        fillHeaders();
        fillContent();
        fillCloseBtn();
        titleGo();
    }

    function onStartUserInteraction(){
        disableConsole();       
    }
    
    function onReStartUserInteraction(){
        disableConsole();        
    }
    
    function onReInitialize(){
         enableConsole();  
    }

    function registerConsole(){
        if(SKBeInstant.isWLA()){
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        }else{
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'paytable',
                    text:paytableText,
                    enabled:1
                }]
            }
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'howToPlay',
                    text:howToPlayText,
                    enabled:1
                }]
            }
        });
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[1]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[1]}
        });
    }  
    
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[0]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[0]}
        });
    }
    function titleGo() {
        var li = document.getElementsByTagName("li");
        var gameRulesSection = document.getElementsByTagName("section")[0];
        var howToPlay = document.getElementById("howToPlay");
        var autoReveal = document.getElementById("autoReveal");
        var aboutTheGame = document.getElementById("aboutTheGame");
        var rules = document.getElementById("rules");
        var topBack = document.getElementsByTagName("b");
        var gameRulesTitle = [howToPlay,autoReveal,aboutTheGame,rules];
		var index;
		function gameRulsTitle(index){
			return function(){
				gameRulesSection.scrollTop = gameRulesTitle[index].offsetTop - gameRulesTitle[index].offsetHeight*4;
			};
		}
		function topBackUp(){
			return function(){
				gameRulesSection.scrollTop = 0;
			};
		}
        for (var i = 0; i < li.length; i++) {
            index = i;
			li[index].onclick = gameRulsTitle(index);
        }
        for (i = 0; i < topBack.length; i++) {
            index = i;         
			topBack[index].onclick = topBackUp();
        }
    }
    function fillHeaders(){
        var gameRulesHeader = document.getElementById('gameRulesHeader');
        var payTableHeader = document.getElementById('paytableHeader');
        var paytableText, howToPlayText;
        if (SKBeInstant.isWLA()) {
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        } else {
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        gameRulesHeader.innerHTML = howToPlayText;
        //gameRulesHeader.innerHTML = loader.i18n.helpHTML;
        payTableHeader.innerHTML = paytableText;
    }

    function fillContent(){
        //fill paytable
        var paytableText = loader.i18n.paytableHTML.replace(/\"/g,"'");
        var name;
        if (SKBeInstant.isWLA()) {
            name = loader.i18n.MenuCommand.WLA.payTable;
        } else {
            name = loader.i18n.MenuCommand.Commercial.payTable;
        }
        paytableText = paytableText.replace('{name}',name);
        
        var tHead = '<table><thead><th>'+ loader.i18n.Game.prizeLevel + '</th><th>' + loader.i18n.Game.prizeValue + '</th></thead>';
        var tBody = '';
        
        var revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        var i, j;
        for (i = 0; i < revealConfigurations.length; i++) {
            tBody += '<h2>' + loader.i18n.Game.paytableWager + SKBeInstant.formatCurrency(revealConfigurations[i].price).formattedAmount + '</h2><p> </p>';
            tBody += tHead;
            tBody += '<tbody>';
            var prizeTable = revealConfigurations[i].prizeTable;
            for(j=0; j< prizeTable.length; j++){
                tBody += '<tr><td>' + (j+1) + '</td><td>' + SKBeInstant.formatCurrency(prizeTable[j].prize).formattedAmount + '</td></tr>';                
            }
            tBody += '</tbody></table>';            
        }
        
        paytableText = paytableText.replace('{paytableBody}',tBody);
        
        var paytableBox = document.getElementById('paytableArticle');
        paytableBox.innerHTML = paytableText;
        
        var howToPlayText = loader.i18n.helpHTML.replace(/\"/g,"'");
        
         if(SKBeInstant.isWLA()){
             howToPlayText = howToPlayText.replace('{payback}','');
         }else{
            var minRTP = SKBeInstant.config.gameConfigurationDetails.minRTP;
            var maxRTP = SKBeInstant.config.gameConfigurationDetails.maxRTP;
            var paybackRTP = "";
            if(minRTP === maxRTP){
                loader.i18n.Paytable.RTPvalue = loader.i18n.Paytable.RTPvalue.replace('{@minRTP}',minRTP);
                paybackRTP = loader.i18n.Paytable.RTPvalue;
            }else{
                loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@minRTP}',minRTP);
                loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@maxRTP}',maxRTP);
                paybackRTP = loader.i18n.Paytable.RTPrange;
            }
            loader.i18n.Paytable.paybackBody = loader.i18n.Paytable.paybackBody.replace('{RTP}',paybackRTP);
            var payback = '<h3>'+ loader.i18n.Paytable.paybackTitle +'</h3><p>'+loader.i18n.Paytable.paybackBody+'</p>';
            
            howToPlayText = howToPlayText.replace('{payback}',payback);
         }
        
        
        var howToPlayBox = document.getElementById('gameRulesArticle');
        howToPlayBox.innerHTML = howToPlayText;
    }

    function fillCloseBtn(){
        var buttons=document.getElementsByClassName('closeBtn');
        Array.prototype.forEach.call(buttons,function(item){
            item.innerHTML = loader.i18n.Game.buttonClose;
            item.onclick=function(){showOne('game');};
        });
    }

    function showOne(id){
        var tabs=document.getElementsByClassName('tab');
        for(var i=0;i<tabs.length;i++){
            tabs[i].style.display='none';
        }
		if(id === 'game'){
			audio.play('ButtonGeneric', 17);
		}else{
			audio.play('ButtonGeneric', 17);
		}
        document.getElementById(id).style.display='block';
    }

    //retrigger clickbtn
    function onGameControl(data){
        if(data.option==='paytable'||data.option==='howToPlay'){
            var id = data.option==='howToPlay'? 'gameRules' : 'paytable';
            if(document.getElementById(id).style.display==='block'){
                showOne('game');
            }else{
                showOne(id);
            }
        }
    }

    function onAbortNextStage(){
        disableConsole();
    }

    function onResetNextStage(){
        enableConsole();
    }
    
    function onEnterResultScreenState(){
        enableConsole();
    }
    
 	msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('onAbortNextStage', onAbortNextStage);
    msgBus.subscribe('onResetNextStage', onResetNextStage);
    msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onGameControl);     
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	return {};
});

