$(document).ready(function() {
  musicListeners();
  // Code: frc374051d5f53ed5d931e7f8eec38db
  // Secret code: 8eba79ca0db48e59c14fb0e3746272bb
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
  $("#searchPlay").bind('ended', function() {
    $("#queue2>li:nth-child(1)").remove();
    decisionizer2();
  });
  $("button").click(function() {
    songCall($("input").val());
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

function decisionizer2() {
  if($("#queue2>li").length) {
    var selectedTrack = $("#queue2>li:nth-child(1)>span").text();
    $("#searchPlay").attr("src", selectedTrack);
    $("#searchPlay").promise().done(function() {
    $("#searchPlay")[0].play();
    });
  }
  else {
    $("#searchPlay")[0].pause();
    $("#searchPlay").attr("src", "#");
    alert("End of queue");
  }
}

function songCall(track) {
  // Powered by Deezer
  alert("You searched for: " + track);
  fetch("https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=" + track).then(
    function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          console.log(data);
          data = data.data;
          for (let i = 0; i < 5; i++) {
            var song = "<li id='" + data[i].id + "'>" + data[i].artist.name + " - " + data[i].title;
            if(data[i].preview) {
              song += "<span style='visibility:hidden;'>" + data[i].preview + "</span></li>";
            }
            else {
              song += " - <em>No audio preview available</em></li>";
            }
            $("#results").append(song);
            $("#"+data[i].id).click(function() {
              // $("#searchPlay").attr("src", data[i].preview);
              // $("#searchPlay")[0].play();
              $("#queue2").append($(this).clone());
              if($("#queue2>li").length === 1) {
                decisionizer2();
              }
              $("#queue2>li").click(function() {
                $(this).remove();
              });
            });
          }
        });
      }
      else {
        alert("Error calling Deezer API. Status code: " + response.status);
        return;
      }
    }
  )
}