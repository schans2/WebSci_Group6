$(document).ready(function() {
  musicListeners();
});

function musicListeners() {
  $("#audioslave").click(function() {
    $("#direct").attr("src", "resources/music/08 I Am the Highway.m4a");
    $("#direct")[0].play();
  })
  $("#metallica").click(function() {
    $("#direct").attr("src", "resources/music/01 Enter Sandman.m4a");
    $("#direct")[0].play();
  });
  $("#weezer").click(function() {
    $("#direct").attr("src", "resources/music/03 Hash Pipe.m4a");
    $("#direct")[0].play();
  });
  $("#choice>li").click(function() {
    $("#queue").append($(this).clone());
    $("#queue>li").click(function() {
      $(this).remove();
    });
  });
}