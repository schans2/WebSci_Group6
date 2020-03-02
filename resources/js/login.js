var fname; var lname; var email; var uname; var pass;
var success = false;

$(document).ready(function() {
  eventListeners();
});

function eventListeners() {
  $("#register").click(function() {
    //write to json database
  });
  $("#signIn").click(function() {
    uname = $("#username").val();
    pass = $("#password").val();
    $.getJSON("./resources/json/loginData.json", function(result) {
      console.log(result);
      for (let i = 0; i < result.info.length; i++) {
        if(result.info[i].uname === uname && result.info[i].pass === pass) {
          alert("You're legit");
          success = true;
        }
      }
      if(!success) {
        alert("Login failed: Please check your credentials and try again");
      }
    });
  });
}