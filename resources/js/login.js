$(document).ready(function() {
  alert("jquery");
  eventListeners();
});

function eventListeners() {
  $("#register").click(function() {
    //write to json database
  });
  $("#login").click(function() {
    $.getJSON("./resources/json/loginData.json", result) {
      alert(result);
    } 
  });
}