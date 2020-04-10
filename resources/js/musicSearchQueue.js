var just_data =  {};

var voteAngularApp = angular.module('playlistApp', []);

voteAngularApp.controller('playlistController', ['$scope', function($scope) {

	// Scope variable instantiation
	// $scope.type = "______";
	$scope.query;
	//$scope.amount = 5;
	//$scope.numbers = [1, 3, 5, 10, 20];
  
	$scope.loadItems = function() {
        $("#searchForm>form>input").css("color", "#1abc9c");
        $("#searchForm>h2>span").css("color", "#1abc9c");
	// Validates all fields are populated
		// if($scope.type && $scope.type != "______" && $scope.amount && $scope.query) {
        if($scope.query) {
			// Sends GET request to Node server with the desired parameters - grabbed from HTML input
			// $.get(("http://localhost:3000/search?type=" + $scope.type + "&amount=" + $scope.amount + "&query=" + $scope.query), 
			$.get(("http://localhost:3000/search?query=" + $scope.query), 
			function(result) {
				console.log(result);
                result = result.tracks.items;
                console.log(result);
                $scope.search_data = [];
                $scope.$apply(function() {
                    for (let i = 0; i < result.length; i++) {
                        // console.log(result[i]);
                        if(result[i].preview_url) { 
                            $scope.search_data.push(result[i]);
                        }
                    }
                    // $scope.search_data = result;
                });
			});
		}
		// Error case
		else {
			alert("Invalid query: Please make sure all fields are filled out");
			return;
		}
	}

    // Music data from a collaborative playlist, later to be dynamically fetched from the database
    $scope.playlist_data = [];
    $scope.search_data = [];
    $scope.addToQueue = function(i){
        let tmp_data = $scope.search_data[i];
        tmp_data.upvotes = 0;
        tmp_data.downvotes = 0;
        // If duplicates found, just terminate
        if($scope.playlist_data.includes(tmp_data)) { return; }
        else { $scope.playlist_data.push(tmp_data); }
        if($scope.playlist_data.length == 1 && audios.paused){ // Which means we have just pushed a song to the empty queue
            decisionizer();
        }
    }

    var i = $("#play-pause-button").find("i");
    var seekTime, seekLocation, seekBar, audios;
    var flag = false;
    initialPlayer();

/*  Deprecated 4-1-20 2:48 PM

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
                        $scope.$apply(function(){
                            $scope.search_data = data;
                        });
                    });
                }
                else {
                    alert("Error calling Deezer API. Status code: " + response.status);
                    return;
                }
            }
        );
    }
*/

    function trackCompare(a, b) {
        // returns 1 when a is more popular than b
        if (a.upvotes-a.downvotes > b.upvotes-b.downvotes) return -1;
        if (b.upvotes-b.downvotes > a.upvotes-a.downvotes) return 1;
        return 0;
    }

    // descisionizer sorts the tracks, picks the best track, then pops the first track
    function decisionizer() {
        if($scope.playlist_data.length) {
            console.log("Current Playlist: ", $scope.playlist_data)
            $scope.playlist_data.sort(trackCompare);
            var selected = $scope.playlist_data[0];
            // Remove the song selected
            // We need to use $apply here to force update
            $scope.playlist_data.splice(0, 1);
            $scope.$evalAsync();
            $(audios).attr("src", selected.preview_url);
            selectedTrack = selected.album.images[0].url;
            $("#album-art").append("<img src='" + selectedTrack + "' class='active' alt='Album Art'/>");
            $("#album-name").text(selected.name);
            // console.log(selected.name)
            $("#track-name").text(selected.artists[0].name);  
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
        /* Fades in and out search results on focus
        $("#searchInput").focusin(function() {
            $("#tmp-searchResult").fadeIn(500);
        });
        $("#searchBtn").focusin(function() {
            $("#tmp-searchResult").fadeIn(500);
        });
        $("#searchInput").focusout(function() {
            $("#tmp-searchResult").fadeOut(500);
        });
        $("#tmp-searchResult").mouseleave(function() {
            $(this).fadeOut(500);
        });
        */
       $("#searchForm>form>input").focusin(function() {
		   $(this).css("color", "goldenrod");
		   $("#searchForm>h2>span").css("color", "goldenrod");
		   $("#searchForm>form>button").fadeIn(500);
	   });
	   $("#searchForm>form>input").focusout(function() {
			$(this).css("color", "#1abc9c");
			$("#searchForm>h2>span").css("color", "#1abc9c");
			$("#searchForm>form>button").fadeOut(500);
		});
    }

    // When an audio ends, an event listener automatically calls the next decisionizer.
    $(audios).bind('ended', function() {
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
        // seekBar.width(seekTime);
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

}]);