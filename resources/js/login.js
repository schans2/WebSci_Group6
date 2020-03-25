var fname; var lname; var email; var uname; var pass;
var success = false;

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
    if(fname && lname && email && uname && pass) {
      alert("Register successful!");
      $("#signup>form")[0].reset();
      $("#username").val(uname);
      $("#password").val(pass);
    }
    else {
      alert("Error: Please make sure all fields are filled out.");
    }
  });
  $("#signIn").click(function() {
    uname = $("#username").val();
    pass = $("#password").val();
    $.getJSON("./resources/json/loginData.json", function(result) {
      // console.log(result);
      for (let i = 0; i < result.info.length; i++) {
        if(result.info[i].uname === uname && result.info[i].pass === pass) {
          // alert("You're legit");
          success = true;
        }
      }
      if(success) {
        window.location.replace("./homePage.html");
      }
      else {
        alert("Login failed: Please check your credentials and try again");
      }
    });
  });
}