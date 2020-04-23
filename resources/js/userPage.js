angular.module('generateApp', []).controller('generateController', ['$scope', '$http', function($scope, $http){

    $scope.init = function(){
        $http.get("/getUserownsPlaylist").then(function(response){
            console.log(response.data.ownsPlaylist);
            $scope.ownPlaylist = response.data.ownsPlaylist;
            $scope.joinedPlaylist = response.data.joinedPlaylist;
        })
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

    $scope.generate = function(){
        $http.get('/createPlaylist').then(function(response){
            console.log("group created");
            var content = response.data;
            alert("Your Join Code is "+content["joinCode"]);
            var id = content["playlist_id"];
            location.replace(`./player/${id}`);
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

    $scope.loadPlaylist = function(input){
        alert(input);
        input = parseInt(input, 10);
        location.replace(`./player/${input}`);
    }

}])