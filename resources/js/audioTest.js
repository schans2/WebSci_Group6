$(document).ready(function() {
  musicListeners();
});

function musicListeners() {
  $("#audioslave").click(function() {
    $("audio").attr("src", "resources/music/08 I Am the Highway.m4a");
  })
  $("#metallica").click(function() {
    $("audio").attr("src", "resources/music/01 Enter Sandman.m4a");
  });
  $("#weezer").click(function() {
    $("audio").attr("src", "resources/music/03 Hash Pipe.m4a");
  });
}