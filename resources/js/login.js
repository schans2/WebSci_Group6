var fname; var lname; var email; var uname; var pass;
var success = false;
var invalid = false;
angular.module('loginApp', [])
    .controller('loginController', ['$scope', '$http', function($scope, $http){
        
        $scope.addUser = function(){
          invalid = false;
          var first_name = document.getElementById('fname').value;
          var last_name = document.getElementById('lname').value;
          var email = document.getElementById('email').value;
          var username = document.getElementById('new_username').value;
          var password = document.getElementById('new_password').value;
          if(first_name.length >  16){
            alert("Sorry, first name too long. Please enter something less than 16 characters.");
            invalid = true;
          }
          else if(last_name.length > 16){
            alert("Sorry, last name too long. Please enter something less than 16 characters");
            invalid = true;
          }
          else if(email.length > 30){
            alert("Sorry, email too long. Please enter something less than 30 characters");
            invalid = true;
          }
          else if(username.length > 16){
            alert("Sorry, username too long. Please enter something less than 16 characters");
            invalid = true;
          }
          else if(password.length > 16){
            alert("Sorry, password name too long. Please enter something less than 16 characters");
            invalid = true;
          }
          //source for regular expression: https://www.w3resource.com/javascript/form/email-validation.php
          else if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            console.log("email validated");
            
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
          else{
            alert("You have entered an invalid email address!");
            invalid = true;
          }
          
        }
        $scope.loginUser = function(){
          $scope.user = {
            uname: $scope.uname,
            pass: $scope.pass
          }
          $http.post('/login', $scope.user).then(function(response){
            console.log(response.data);
            if(!response.data.error){
              alert("Login Successful!")
              window.location.href = "/user";
            }
            else{
              alert("Username or password incorrect!");
            }
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
  if(invalid == false){
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
          //THIS CRASHES SERVER DUE TO HASH AND SALT SO COMMENTED IT OUT
          // $("#username").val(uname);
          // $("#password").val(pass);
        },
        error: function(message, status){
          console.log(`Oops! Register request returns failure with message ${message} and status ${status}.`);
        }
      });
    }
    else {
      alert("Error: Please make sure all fields are filled out.");
    }
  }
  else{
    console.log("Invalid");
  }
  });
  // Old login
  // $("#signIn").click(function() {
  //   uname = $("#username").val();
  //   pass = $("#password").val();
  //   // Send Credentials to Server
  //   if(uname && pass) {
  //     $.ajax({
  //       method    : "POST",
  //       url       : "/login",
  //       data      : {
  //         "uname" : uname,
  //         "pass"  : pass
  //       },
  //       success: function(message, status){
  //         console.log(`Register request returns success with message ${message} and status ${status}.`);
  //         alert("Login successful!");
  //         window.location.href = "/user";
  //       },
  //       error: function(message, status){
  //         console.log(`Oops! Register request returns failure with message ${message} and status ${status}.`);
  //       }
  //     });
  //   }
  //   else {
  //     alert("Error: Please make sure all fields are filled out.");
  //   }
  //   /*
  //   $.getJSON("./resources/json/loginData.json", function(result) {
  //     if(!result.error) {
  //       window.location.replace("/");
  //     }
  //     else {
  //       alert("Login failed: Please check your credentials and try again");
  //     }
  //   });
  //   */
  // });
}