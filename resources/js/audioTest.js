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
    if($("#queue>li").length === 1) {
      decisionizer();
    }
    $("#queue>li").click(function() {
      $(this).remove();
    });
  });
  // Help from:
  // https://stackoverflow.com/questions/9346579/how-can-i-tell-when-an-html5-audio-element-has-finished-playing
  $("#qPlay").bind('ended', function() {
    $("#queue>li:nth-child(1)").remove();
    decisionizer();
  });
}

function decisionizer() {
  if($("#queue>li").length) {
    if($("#queue>li:nth-child(1)").attr("id") === "audio") {
      $("#qPlay").attr("src", "resources/music/08 I Am the Highway.m4a");
    }
    else if($("#queue>li:nth-child(1)").attr("id") === "metal") {
      $("#qPlay").attr("src", "resources/music/01 Enter Sandman.m4a");
    }
    else if($("#queue>li:nth-child(1)").attr("id") === "weez") {
      $("#qPlay").attr("src", "resources/music/03 Hash Pipe.m4a");
    }
    $("#qPlay")[0].play();
  }
  else {
    $("#qPlay")[0].pause();
    $("#qPlay").attr("src", "#");
    alert("End of queue");
  }
}