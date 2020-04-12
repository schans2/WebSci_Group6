var fname; var lname; var email; var uname; var pass;
var success = false;
angular.module('loginApp', [])
    .controller('loginController', ['$scope', '$http', function($scope, $http){
        $scope.addUser = function(){
          var first_name = document.getElementById('fname').value;
          var last_name = document.getElementById('lname').value;
          var email = document.getElementById('email').value;
          var username = document.getElementById('new_username').value;
          var password = document.getElementById('new_password').value;

          $scope.new_user = {
            fname: first_name,
            lname: last_name,
            e_address: email,
            user: username,
            pass: password
          }
          console.log($scope.new_user);
          $http.post('/newUser', $scope.new_user).then(function(response){
            console.log("post successful");
          });
        }
        $scope.loginUser = function(){
          var uname = document.getElementById("username").value;
          var pass = document.getElementById("password").value;

          $scope.user = {
            uname: uname,
            pass: pass
          }
          $http.post('/login', $scope.user).then(function(response){
            console.log("post successful");
          });
        }
    }]);



$(document).ready(function() {
  eventListeners();
});

function eventListeners() {
  $("#register").click(function() {
    fname = $("#fname").val();
    lname = $("#lname").val();
    email = $("#email").val();
    uname = $("#new_username").val();
    pass = $("#new_password").val();

    // <<INPUT VALIDATION NEEDED>>

    if(fname && lname && email && uname && pass) {
      // Send Register Request to Server
      $.ajax({
        method: "POST",
        url: "/register",
        data: {
          "fname": fname,
          "lname": lname,
          "email": email,
          "uname": uname,
          "pass": pass
        },
        success: function(message, status){
          console.log(`Register request returns success with message ${message} and status ${status}.`);
          alert("Register successful!");
          $("#signup>form")[0].reset();
          $("#username").val(uname);
          $("#password").val(pass);
        },
        error: function(message, status){
          console.log(`Oops! Register request returns failure with message ${message} and status ${status}.`);
        }
      });
    }
    else {
      alert("Error: Please make sure all fields are filled out.");
    }
  });
  $("#signIn").click(function() {
    uname = $("#username").val();
    pass = $("#password").val();
    // Send Credentials to Server
    $.getJSON("./resources/json/loginData.json", function(result) {
      // console.log(result);
      for (let i = 0; i < result.info.length; i++) {
        if(result.info[i].uname === uname && result.info[i].pass === pass) {
          // alert("You're legit");
          success = true;
        }
      }
      if(success) {
        window.location.replace("/");
      }
      else {
        alert("Login failed: Please check your credentials and try again");
      }
    });
  });
}