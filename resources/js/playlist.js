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

}]);