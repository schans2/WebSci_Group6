$(function(){
    var currentIndex = -1;
    var i = $("#play-pause-button").find("i");
    var seekTime, seekLocation;
    var seekBar = $("#seek-bar");
    var nTime = 0;
    var bTime;
    var flag = false;
    var audios;
    var resource = "./resources/json/playlist.json";


    function showHover(event){
        var barP = $("#s-area").offset();
        seekTime = event.clientX - barP.left;
        seekLocation = audios.duration*(seekTime/$("#s-area").outerWidth());
        $("#s-hover").width(seekTime);
        var cM = seekLocation/60;
        var min = Math.floor(cM);
        var sec = Math.floor(seekLocation-min*60);
        if((min<0)||(sec<0)){return;}
        if(min<10){min = "0"+min;}
        if(sec<10){sec = "0"+sec;}
        if(isNaN(min)||isNaN(sec)){$("#ins-time").text("--:--");}
        else{$("#ins-time").text(min+":"+sec);}
		$("#ins-time").css({'left':seekTime,'margin-left':'-21px'}).fadeIn(0);
    }

    function hideHover(){
        $("#s-hover").width(0);
        $("#ins-time").text('00:00');
        $("#ins-time").css({'left':'0px','margin-left':'0px'});
        $("#ins-time").fadeOut(0);
    }

    function playFormClickPos(){
        audios.currentTime = seekLocation;
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
        var cmin = Math.floor(audios.currentTime / 60);
        var csec = Math.floor(audios.currentTime - cmin * 60);
        var dmin = Math.floor(audios.duration / 60);
        var dsec = Math.floor(audios.duration - dmin * 60);
        var playProgress = (audios.currentTime / audios.duration) * 100;
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

    function selectTrack(ff,audi){
        if(ff==0||ff==1){
            ++currentIndex;
        }else{
            --currentIndex;
        }
        $.getJSON(resource,function(data){
            if((currentIndex>-1)&&(currentIndex<data.length)){
                if(ff == 0){
                    i.attr('class','fa fa-play');
                }else{
                    i.attr('class','fa fa-pause');
                }
                seekBar.width(0);
                $("#track-time").removeClass('active');
                $("#current-time").text('00:00');
                $("#track-length").text('00:00');
                nTime = 0;
                bTime = new Date();
                bTime = bTime.getTime();
                var currentTrack = data[currentIndex].TrackName;
                var currentAlbum = data[currentIndex].AlbumName;
                var currentCover = data[currentIndex].cover;
                var currentUrl = data[currentIndex].url;
                audi.src = currentUrl;
                $("#playAudio").src = currentUrl;
                if (ff != 0){
                    audi.play();
                    $("#player-track").addClass("active");
                    $("#album-art").addClass("active");
                }
                $("#album-name").text(currentAlbum);
                $("#track-name").text(currentTrack);
                //var temp = "<img src=\""+currentCover+"\" class=\"active\">";
                //$("#album-art").append(temp);
            }else{
                if(ff == 0 || ff == 1){
                    ++currentIndex;
                }else{
                    --currentIndex;
                }
            }
        })
    }

    function initialPlayer(){
        audios = new Audio();
        selectTrack(0,audios);
        audios.loop = false;
        $("#play-pause-button").on("click",function(){
            if(audios.paused){
                $("#player-track").addClass("active");
                $("#album-art").addClass("active");
                i.attr("class","fa fa-pause");
                audios.play();
            }else{
                $("#player-track").removeClass("active");
                $("#album-art").removeClass("active");
                i.attr("class","fa fa-play");
                audios.pause();
            }  
        });
        $("#s-area").mousemove(function(event){
            showHover(event);
        });
        $("#s-area").mouseout(hideHover);
        $("#s-area").on("click",playFormClickPos);
        $(audios).on("timeupdate",updateCurrentTime);
        $("#play-previous").on("click",function(){
            selectTrack(-1,audios);
        });
        $("#play-next").on("click",function(){
            selectTrack(1,audios);
        });
    }

    initialPlayer();

    $(audios).bind('ended', function() {
        // alert("Is this a thing?");
        $("#queue>li:nth-child(1)").remove();
        decisionizer();
    });
    $("button").click(function() {
        songCall($("#search").val());
    });

    function songCall(track) {
			// Powered by Deezer
			$("#searchResult").html("");
			fetch("https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=" + track).then(
				function(response) {
					if(response.status === 200) {
						response.json().then(function(data) {
							console.log(data);
							data = data.data;
							for (let i = 0; i < 10; i++) {
								var song = "<li id='" + data[i].id + "'>" + data[i].artist.name + " - " + data[i].title;
								if(data[i].preview) {
									song += "<span class='audioPreview' style='visibility:hidden;'>" + data[i].preview + "</span>";
								}
								else {
									song += "<em class='audioPreview'> - No audio preview available</em>";
								}
								if(data[i].album.cover) {
									song += "<span class='coverArt' style='visibility:hidden;'>" + data[i].album.cover + "</span></li>";
								}
								else {
									song += "<span class='coverArt' style='visibility:hidden;'>resources/thumb.png</span></li>";
								}
								$("#searchResult").append(song);
								$("#"+data[i].id).click(function() {
									$("#queue").append($(this).clone());
									if($("#queue>li").length === 1) {
										decisionizer();
									}
									$("#queue>li").click(function() {
										$(this).remove();
									});
								});
							}
						});
					}
					else {
						alert("Error calling Deezer API. Status code: " + response.status);
						return;
					}
				}
			);
    }

    function decisionizer() {
        if($("#queue>li").length) {
          var selectedTrack = $("#queue>li:nth-child(1)>span.audioPreview").text();
					$(audios).attr("src", selectedTrack);
					selectedTrack = $("#queue>li:nth-child(1)>span.coverArt").text();
					$("#album-art").append("<img src='" + selectedTrack + "' class='active' alt='Album Art'/>");
					selectedTrack = $("#queue>li:nth-child(1)").text();
					$("#album-name").text(selectedTrack.substring(0, selectedTrack.indexOf('-') - 1));
					$("#track-name").text(selectedTrack.substring(selectedTrack.indexOf('-') + 2, selectedTrack.indexOf("http")));  
					$("#player-track").addClass("active");
					$("#album-art").addClass("active");
					i.attr("class", "fa fa-pause");
          $(audios).promise().done(function() {
            $(audios)[0].play();
          });
        }
        else {
          $("#player-track").removeClass("active");
          $("#album-art").removeClass("active");
          i.attr("class", "fa fa-play");
          audios.pause();
          alert("End of queue");
        }
    }
	
    $("#searchBtn").click(function(){
        if ($("#searchInput").val() != "") {
            songCall($("#searchInput").val());
            //$("#searchResult").append("<li class=\"list-group-item\">"+content+"</li>");
            //$("#searchResult").append("<li class=\"list-group-item list-group-item-dark\" id=\"clearList\">Clear Search Result</li>");
            $("#clearList").click(function(){
                $(("#searchResult")).empty();
            })
        }else{
            console.log("need to input");
        }
    });
});
