angular.module('homeApp', []).controller('homeController', ['$scope', '$http', function($scope, $http){
    $scope.checkStatus = function(){
        $http.get("/checkStatus").then(function(response){
            $scope.status = response.data.status;
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
                
    $scope.join = function(){
        //alert("hello");
        var code = document.getElementById("search").value;
        if(code == ""){
            alert("Please enter your code to continue...");
        }
        else{
            $scope.code = {
                joinCode: code,
            }
            $http.post("/joinGroup", $scope.code).then(function(response){
                console.log("joining playlist...");
                location.replace(`./player/${code}`);
            });
        }           
    }
                
    $scope.signOut = function(){
        alert("Signing user out...");
        $http.get("/removeLogin").then(function(response){
            console.log("removing logged in user");
            console.log(response.data);
        });
        location.replace("/");
    }
}]);