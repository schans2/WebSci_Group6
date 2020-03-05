var just_data =  {};

var voteAngularApp = angular.module('playlistApp', []);

voteAngularApp.controller('playlistController', ['$scope', function($scope){
    // Music data from a collaborative playlist, later to be dynamically fetched from the database
    $scope.playlist_data = [
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
                            $scope.data = data
                        })

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

}]);