var just_data =  {};

var voteAngularApp = angular.module('playlistApp', []);

voteAngularApp.controller('playlistController', ['$scope', function($scope){
    // Music data from a collaborative playlist, later to be dynamically fetched from the database
    $scope.music_data = [
        {
            "name": "Song A",
            "upvotes": 100,
            "downvotes": 20
        },
        {
            "name": "Song B",
            "upvotes": 10,
            "downvotes": 10
        },
        {
            "name": "Song C",
            "upvotes": 5,
            "downvotes": 100
        },
        {
            "name": "Song D",
            "upvotes": 200,
            "downvotes": 180
        }
    ];

    var i = $("#play-pause-button").find("i");
    initialPlayer();

    $scope.songCall = function(track) {
        if(!$scope.track || $scope.track == ''){
            alert("invalid track input!");
            return;
        }
        // Powered by Deezer
        $("#searchResult").html("");
        fetch("https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=" + track).then(
            function(response) {
                if(response.status === 200) {
                    response.json().then(function(data) {
                        console.log(data);
                        data = data.data;
                        console.log($scope.music_data[0].name)
                        $scope.$apply(function(){
                            $scope.music_data[0].name = data[0].title;
                        })
                        console.log($scope.music_data[0].name)

                        for (let i = 0; i < 10; i++) {
                            var song = "<li class='list-group-item' id='" + data[i].id + "'>" + data[i].artist.name + " - " + data[i].title;
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
    function initialPlayer(){
        audios = new Audio();
        // selectTrack(0,audios);
        audios.loop = false;
        $("#play-pause-button").on("click",function(){
            if(audios.paused){
                $("#player-track").addClass("active");
                $("#album-art").addClass("active");
                i.attr("class","fa fa-pause");
                audios.play();
            } else {
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
            //selectTrack(-1,audios);
            console.log("Skip back");
        });
        $("#play-next").on("click",function(){
            //selectTrack(1,audios);
            $("#queue>li:nth-child(1)").remove();
            decisionizer();
        });
    }

    $(audios).bind('ended', function() {
        // alert("Is this a thing?");
        $("#queue>li:nth-child(1)").remove();
        decisionizer();
    });

    function hideHover(){
        $("#s-hover").width(0);
        $("#ins-time").text('00:00');
        $("#ins-time").css({'left':'0px','margin-left':'0px'});
        $("#ins-time").fadeOut(0);
    }

    function playFormClickPos(){
        audios.currentTime = seekLocation;
        //seekBar.width(seekTime);
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
        var csec = Math.floor(audios.currentTime - audios.curMinutes * 60);
        var dmin = Math.floor(audios.duration / 60);
        var dsec = Math.floor(audios.duration - audios.durMinutes * 60);
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
       // seekBar.width(playProgress+"%");
        if(playProgress == 100){
            i.attr('class','fa fa-play');
			//seekBar.width(0);
            $("#current-time").text('00:00');
        }
    }

}]);