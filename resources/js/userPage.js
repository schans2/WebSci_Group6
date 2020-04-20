angular.module('generateApp', []).controller('generateController', ['$scope', '$http', function($scope, $http){
    $.get("/infograb", function(result) {
        if(result !== "No login") {
            $("#username").html(result + "'s page");
        }
        else { window.location.href = "/login"; }
    });

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

    $scope.generate = function(){
        var ans = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for(var i = 0; i < 6; i++){
            ans += characters.charAt(Math.floor(Math.random()* charactersLength));
        }
        console.log(ans);
        alert("Your playlist code is: " + ans);
        var id = Math.floor(100000 + Math.random() * 900000);
        console.log(id);
        $scope.playlist = {
            id: id,
            joinCode: ans,
        }
        $http.post('/createGroup', $scope.playlist).then(function(response){
            console.log("group created");
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

}])