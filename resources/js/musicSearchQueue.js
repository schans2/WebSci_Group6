var just_data =  [];

var voteAngularApp = angular.module('playlistApp', []);

voteAngularApp.controller('playlistController', ['$scope', '$http', function($scope, $http) {
    var playlist_id = window.location.pathname.split('/').slice(-1)[0];
    //console.log("plalist id: "+playlist_id);
    var socket = io('', { query: { playlistId : playlist_id} });

    // Not in use. Use Socket.io instead
    // $scope.loadPlaylist = function(){
    //     var list = {code: playlist_id};
    //     $http.post("/getGroup",list).then(function(response){
    //         // gets the json of the playlist data
    //         //now put this data onto the page
    //         console.log(response.data);
	//         var tracks = response.data.tracks;
    //         console.log(tracks);
    //         $scope.playlist_data = [];
    //         if(tracks){
    //             $scope.playlist_data = tracks;
    //         }
    //     });
    // }

    $scope.savePlaylist = function(){
        //keep track of what songs are added to the queue
        //when this function executes add a database entry with:
            //the user who owns the playlist (user who is logged in basically)
            //array of all the tracks
            //on click of a album in localhost:3000/user, they should be able to go back to the (will do in another function)
            //original playlist they saved with all songs loaded into queue (will do in another function)
        console.log("Saving playlist....");
        console.log(just_data);
        $http.post('/savePlaylist', just_data).then(function(response){
            if(response.data && response.data.hasOwnProperty("error")){
                alert("Save Playlist Success!");
            }
            else{
                alert("Playlist not saved. Login first.");
            }
        });
    }
	
    $scope.checkStatus = function(){
        $http.get("/checkStatus").then(function(response){
            $scope.status = response.data.loginStatus;
            console.log($scope.status);
            if($scope.status == null){
                document.getElementById("account").style.display = "none";
                document.getElementById("out").style.display = "none";
            }
            else{
                document.getElementById("log").style.display = "none";
                document.getElementById("sign").style.display = "none";
            }

        });
    }
    $scope.signOut = function(){
        alert("Signing user out...");
        $http.get("/logout").then(function(response){
            console.log("removing logged in user");
            console.log(response.data);
        });
        location.replace("/");
    }
	// Scope variable instantiation
	// $scope.type = "______";
	$scope.query;
	//$scope.amount = 5;
	//$scope.numbers = [1, 3, 5, 10, 20];
  
	$scope.loadItems = function() {
		$("#searchForm>form>input").css("color", "#1abc9c");
        $("#searchForm>form>button").fadeOut(500);
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
				$scope.spotify_search_data = [];
				// $("#tmp-searchResult>li").click(function() {
				// 	$(this).css("backgroundColor", "red");
				// });
                $scope.$apply(function() {
                    for (let i = 0; i < result.length; i++) {
                        // console.log(result[i]);
                        if(result[i].preview_url) { 
                            $scope.spotify_search_data.push(result[i]);
                        }
                    }
                    // $scope.search_data = result;
				});
				fetch("https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=" + $scope.query).then(
					function(response) {
						if(response.status === 200) {
							response.json().then(function(data) {
								console.log(data);
								data = data.data;
								$scope.deezer_search_data = [];
								$scope.$apply(function(){
									for (let j = 0; j < data.length; j++) {
										if(data[j].preview) {
											$scope.deezer_search_data.push(data[j]);
                                        }
                                        if(j === 14) { break; }
									}
								});
							});
						}
						else {
							alert("Error calling Deezer API. Status code: " + response.status);
							return;
						}
					}
				);
			});
		}
		// Error case
		else {
			alert("Invalid query: Please make sure all fields are filled out");
			return;
		}
    }
    
    /**
     * When the upvote button is clicked, this function is called.
     * It increments the upvote of a track and emits a socket.io message notifying others in the chat room
     */
    $scope.upvoteTrack = function(track){
        track.upvotes += 1;
        socket.emit('upvote', track.id);
    }

    /**
     * When the downvote button is clicked, this function is called.
     * It increments the downvote of a track and emits a socket.io message.
     */
    $scope.downvoteTrack = function(track){
        track.downvotes += 1;
        socket.emit('downvote', track.id);
    }

    $scope.broadcastAddTrack = function(track_info){
        socket.emit('addTrack', track_info);
    }

    // Music data from a collaborative playlist, later to be dynamically fetched from the database
    $scope.playlist_data = [];
	$scope.spotify_search_data = [];
    $scope.deezer_search_data = [];
    console.log($scope.playlist_data);
    $scope.addToQueue = function(i, type) {
		// console.log(type);
		var tmp_data;
		if(type === "deezer") {
            tmp_data = $scope.deezer_search_data[i];
            tmp_data.service = "deezer";
            if(!(just_data.includes(tmp_data))) {
                just_data.push(tmp_data);
            }
        }
        else {
            tmp_data = $scope.spotify_search_data[i];
            tmp_data.service = "spotify";
            if(!(just_data.includes(tmp_data))) {
                just_data.push(tmp_data);
            }
        }
        tmp_data.upvotes = 0;
        tmp_data.downvotes = 0;
        console.log($scope.playlist_data);
        if($scope.playlist_data == undefined){
            $scope.playlist_data = [];
        }
        // If duplicates found, just terminate
        if($scope.playlist_data.includes(tmp_data)) { return; }
        else { $scope.playlist_data.push(tmp_data); $scope.broadcastAddTrack(tmp_data); }
		if($scope.playlist_data.length == 1 && audios.paused){ // Which means we have just pushed a song to the empty queue
            decisionizer();
		}
		if($scope.playlist_data.length === 1) {
			$("#tempWedge").fadeOut(500);
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
			if($scope.playlist_data.length === 1) { $("#tempWedge").fadeIn(500); }
            console.log("Current Playlist: ", $scope.playlist_data);
            $scope.playlist_data.sort(trackCompare);
            var selected = $scope.playlist_data[0];
            // Remove the song selected
            // We need to use $apply here to force update
            $scope.playlist_data.splice(0, 1);
			$scope.$evalAsync();
			if(selected.name) { 
				$(audios).attr("src", selected.preview_url);
				selectedTrack = selected.album.images[0].url;
				$("#album-art").append("<img src='" + selectedTrack + "' class='active' alt='Album Art'/>");
				$("#album-name").text(selected.name);
				// console.log(selected.name)
				$("#track-name").text(selected.artists[0].name);
			}
			else { 
				$(audios).attr("src", selected.preview);
				selectedTrack = selected.album.cover_medium;
				$("#album-art").append("<img src='" + selectedTrack + "' class='active' alt='Album Art'/>");
				$("#album-name").text(selected.title);
				// console.log(selected.name)
				$("#track-name").text(selected.artist.name);
			}  
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

    // Socket.io Stuff
    socket.on('initialData', function(message, join_code){
        console.log("Receives initial data. ", message);
        $scope.playlist_data = message;
        $scope.join_code = join_code;
        $scope.$apply();
        if($scope.playlist_data.length) {
            if(confirm("Ready to play?")) { decisionizer(); }
            else {
                var selected = $scope.playlist_data[0];
                $scope.playlist_data.splice(0, 1);
                $scope.$evalAsync();
                if(selected.name) { 
                    $(audios).attr("src", selected.preview_url);
                    selectedTrack = selected.album.images[0].url;
                    $("#album-art").append("<img src='" + selectedTrack + "' class='active' alt='Album Art'/>");
                    $("#album-name").text(selected.name);
                    // console.log(selected.name)
                    $("#track-name").text(selected.artists[0].name);
                }
                else { 
                    $(audios).attr("src", selected.preview);
                    selectedTrack = selected.album.cover_medium;
                    $("#album-art").append("<img src='" + selectedTrack + "' class='active' alt='Album Art'/>");
                    $("#album-name").text(selected.title);
                    // console.log(selected.name)
                    $("#track-name").text(selected.artist.name);
                } 
            }
        }
    });

    socket.on('upvote', function(message){
        var track_id = message;
        if(!$scope.playlist_data) return;
        var target_track = $scope.playlist_data.find(element => element.id == track_id);
        if(!target_track) return;
        target_track.upvotes += 1;
        $scope.$apply();
    });

    socket.on('downvote', function(message){
        var track_id = message;
        if(!$scope.playlist_data) return;
        var target_track = $scope.playlist_data.find(element => element.id == track_id);
        if(!target_track) return;
        target_track.downvotes += 1;
        $scope.$apply();
    });

    socket.on('addTrack', function(message){
        var track_info = message;
        if(!$scope.playlist_data) return;
        $scope.playlist_data.push(track_info);
        $scope.$apply();
    });


}]);

/*
  This directive allows us to pass a function in on an enter key to do what we want.
  I literally copy-pasted this clutch piece of code from:
  https://eric.sau.pe/angularjs-detect-enter-key-ngenter/
  Hope that's cool since it's cited and non-essential functionality :)
*/
voteAngularApp.directive('ngEnter', function () {
	return function (scope, element, attrs) {
	  element.bind("keydown keypress", function (event) {
		if(event.which === 13) {
		  scope.$apply(function (){
			scope.$eval(attrs.ngEnter);
		  });
		  event.preventDefault();
		}
	  });
	};
  });
