$(function(){

    var i = $("#play-pause-button").find("i");
    var seekTime, seekLocation,seekBar;
    var nTime = 0;
    var flag = false;

    function PlayPause(){
        setTimeout(function(){
            if(audio.paused){
                $("#player-track").addClass("active");
                $("#album-art").addClass("active");
                i.attr("class","fa fa-pause");
                audio.play();
            }else{
                $("#player-track").removeClass("active");
                $("#album-art").removeClass("active");
                i.attr("class","fa fa-play");
                audio.pause();
            }
        },300)
    }

    function showHover(event){
        var barP = $("#s-area").offset();
        seekTime = event.clientX - barP.left;
        seekLocation = audio.duration*(seekTime/$("#s-area").outerWidth());
        $("#s-hover").width(seekTime);
        var cM = seekLocation/60;
        var min = Math.floor(cM);
        var sec = Math.floor(seekLocation-min*60);
        if((min<0)||(sec<0)){return;}
        if(min<10){min = "0"+min;}
        if(sec<10){sec = "0"+sec;}
        if(isNaN(min)||isNaN(sec)){$("#ins-time").text("--:--");}
        else{$("#ins-time").text(min+":"+sec);}
		$("#ins-time").css({'left':seekT,'margin-left':'-21px'}).fadeIn(0);
    }

    function hideHover(){
        $("#s-hover").width(0);
        $("#ins-time").text('00:00');
        $("#ins-time").css({'left':'0px','margin-left':'0px'});
        $("#ins-time").fadeOut(0);
    }

    function playFormClickPos(){
        audio.currentTime = seekLocation;
        seekBar.width(seekTime);
        hideHover();
    }

    function updateCurrentTime(){
        nTime = new Date();
        nTime = nTime.getTime();
        if(!flag){
            flag = true;
            $("#track-time").addClass("active");
        }
        var cmin = Math.floor(audio.currentTime / 60);
        var csec = Math.floor(audio.currentTime - curMinutes * 60);
        var dmin = Math.floor(audio.duration / 60);
        var dsec = Math.floor(audio.duration - durMinutes * 60);
        var playProgress = (audio.currentTime / audio.duration) * 100;
        if(cmin<10){cmin = "0"+cmin;}
        if(csec<10){csec = "0"+csec;}
        if(dmin<10){dmin = "0"+dmin;}
        if(dsec<10){dsec = "0"+dsec;}
        if(isNaN(cmin)||isNaN(csec)){$("#current-time").text("00:00");}
        else{$("#current-time").text(cmin+":"+csec);}
        if(isNaN(dmin)||isNaN(dsec)){$("#track-length").text("00:00");}
        else{$("#track-length").text(dmin+":"+dsec);}
        if(isNaN(cmin)||isNaN(csec)||isNaN(dmin)||isNaN(dsec)){$("#track-time").removeClass("active");}
        else{$("track-time").addClass("active");}
        seekBar.width(playProgress+"%");
        if(playProgress == 100){
            i.attr('class','fa fa-play');
			seekBar.width(0);
            $("#current-time").text('00:00');
        }
    }
})