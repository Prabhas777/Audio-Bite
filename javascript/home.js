const player = $("#player");
$("#circle").attr("class", "play");
$("#from_pause_to_play")[0].beginElement();

current_video_id = ''
// BASE_URL = "https://audiobite.vercel.app"  // Base URL without / at the end
BASE_URL = ""

SONGS_QUEUE = [];

window.onload = function () {
  path = location.pathname;
  if (path.startsWith("/v/")) {
    path = path.slice(3).replaceAll("/", "");
    current_video_id = path;
    playsong("", "js");
  }

  $(".music-body").tilt({
    perspective: 1000,
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}

player[0].ontimeupdate = function () {
  minutes = parseInt(player[0].currentTime / 60);
  seconds = parseInt(player[0].currentTime % 60);
  durMinutes = parseInt(player[0].duration / 60);
  durSeconds = parseInt(player[0].duration % 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (durMinutes < 10) {
    durMinutes = "0" + durMinutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (durSeconds < 10) {
    durSeconds = "0" + durSeconds;
  }
  $(".music-data .time-stamp").text(`${minutes}:${seconds} / ${durMinutes}:${durSeconds}`);
  reqwidth = player[0].currentTime / player[0].duration;
  $(".music-body .progress-bar .inner").css("width", reqwidth * 100 + "%");
};

player[0].onerror = function (e) {
  if (player[0].src != location.href) {
    errorPopup(playsong, {}, "player");
  }
}

$(".search-bar form").submit(function (e) {
  e.preventDefault();
  $(".loading").addClass("active");
  q = $(".search-bar input").val();
  $(".search-results").find(".search-result:not('.hidden')").remove();
  if (q != "") {
    thisForm = $(this);
    $.ajax({
      type: "GET",
      url: BASE_URL + "/api/getsongs/?q=" + q,
      success: function (response) {
        response.results.forEach(function (result) {
          item = $(".search-result.hidden").clone();
          item.removeClass("hidden");
          item.find("img").attr("src", result.thumbnails[0]);
          item.find(".title").text(result.title);
          item.attr("data-id", result.id);
          $(".search-results").append(item);
        });
        $(".loading").removeClass("active");
        $(".search-results").addClass("active");
      },
    });
  }
});

function playsong(e, type) {
  $(".loading").addClass("active");
  if (type == "html") {
    video_id = e.attr("data-id");
  } else {
    video_id = current_video_id;
  }
  history.pushState({}, "", "/v/" + video_id);
  $(".search-results").removeClass("active");
  $(".search-results").find(".search-result:not('.hidden')").remove();
  $.ajax({
    type: "GET",
    url: BASE_URL + "/api/getsong/?q=" + video_id,
    success: function (response) {
      if ("error" in response) {
        errorPopup(playsong, e, type);
      } else {
        setSong(response);
      }
    },
  });
}


function loadRecommendations(video_id) {
  $.ajax({
    url: BASE_URL + "/api/recommendations",
    type: "get",
    data: {
      id: video_id,
    },
    success: function (response) {
      if (response.results.length != 0) {
        $(".recommendations .recomm-result:not('.hidden')").remove();
        response.results.forEach((card) => {
          new_card = $(".recommendations .recomm-result.hidden").clone();
          new_card.removeClass("hidden");
          new_card.attr("data-id", card.videoId);
          new_card.find("img").attr("src", card.thumbnail);
          new_card.find(".title").text(card.title);
          $(".recommendations").append(new_card);
        });
        $(".recommendations")[0].scrollTo(0, 0);
        $(".recommendations").css("display", "flex");
      }
    },
    error: function (xhr) { },
  });
}

function setSong(response) {
  url = response.playurl;
  video_id = response.video_id;
  title = response.title;
  description = response.description;
  player.attr("src", response.playurl);
  $(".music-body .thumbnail-holder img").attr("src", response.thumbnail);
  $(".music-body .song-name").text(title);
  if (description.length > 255) {
    description = description.slice(0, 250) + "...";
  }
  $(".thumbnail-holder .bio p").text(description);
  $(".loading").removeClass("active");
  $("#circle").attr("class", "");
  $("#from_play_to_pause")[0].beginElement();
  player[0].play();
  loadRecommendations(video_id);
  current_video_id = video_id;
}

function play_pause() {
  if (player[0].src != location.href) {
    if (player[0].paused) {
      $("#circle").attr("class", "");
      $("#from_play_to_pause")[0].beginElement();
      player[0].play();
    } else {
      $("#circle").attr("class", "play");
      $("#from_pause_to_play")[0].beginElement();
      player[0].pause();
    }
  }
}

$(".progress-bar").on("click", function (e) {
  if (player[0].src != "") {
    reqSeek = e.offsetX / e.target.offsetWidth;
    player[0].currentTime = reqSeek * player[0].duration;
  }
});

$("body").click(function () {
  $(".search-results").removeClass("active");
  $(".search-results").find(".search-result:not('.hidden')").remove();
  $(".query-results").removeClass("active");
});

$(".search-bar form input[type='text']").on("input", function (e) {
  search(e.target.value);
});

$(".search-bar form input[type='text']").on("keydown", function (e) {
  if (e.keyCode == 40) {
    $(".query-results .query:first-child").focus();
  }
});

function set_query(e) {
  var data = e.target.innerText;
  $(".search-bar form input[type='text']").val(data);
  $(".search-bar form").submit();

}

function add_query(list) {
  $(".query-results").html("");
  list.forEach((li) => {
    query = $("<button>");
    query[0].onclick = set_query;
    query.addClass("query").html(li[0]).appendTo(".query-results");
  });
  $(".query-results").addClass("active");
}

function search(q) {
  $.ajax({
    url: BASE_URL + "/api/search",
    type: "get",
    data: {
      q: q,
    },
    success: function (response) {
      if (response.data != "") {
        x = response.data.slice(19, response.data.length - 1);
        data = JSON.parse(x)[1];
        add_query(data);
      } else {
        $(".query-results").html("");
        $(".query-results").removeClass("active");
      }
    },
    error: function (xhr) { },
  });
}


window.onkeydown = (e) => {
  if ($(".search-bar input[name='q']")[0] !== document.activeElement) {
    if (e.keyCode == 32 && $(".play_or_pause")[0] !== document.activeElement) {
      play_pause();
    } else if (e.keyCode == 37) {
      player[0].currentTime -= 5;
    } else if (e.keyCode == 39) {
      player[0].currentTime += 5;
    }
  }
};

function errorPopup(callback, e, type) {
  config = {
    title: "Encountered an error!",
    content: "Something went Wrong",
    type: "red",
    typeAnimated: true,
    buttons: {
      close: function () {
        $(".loading").removeClass("active");
        playNextVideo();
      },
    },
  };
  if (type != "player") {
    config["buttons"]["tryAgain"] = {
      text: "Try again",
      btnClass: "btn-red",
      action: function () {
        callback(e, type);
      },
    };
  }
  $.confirm(config);
}

$(".query-results").on("keydown", function (e) {
  var index = $(":focus").index() + 1;
  if (e.which === 38) {
    $(".query-results .query:nth-child(" + (index - 1) + ")").focus();
  } else if (e.which === 40) {
    $(".query-results .query:nth-child(" + (index + 1) + ")").focus();
  }
});

window.onpopstate = function (e) {
  path = location.pathname;
  if (path.startsWith("/v/")) {
    path = path.slice(3).replaceAll("/", "");
    current_video_id = path;
    playsong("", "js");
  }
};


$(".recommendations").on("wheel", function (e) {
  $(".recommendations")[0].scrollBy(e.originalEvent.deltaY, 0);
});

function playNext(e) {
  e.stopPropagation();
  recommCard = $(e.target).closest(".recomm-result");
  videoId = recommCard.attr("data-id");
  SONGS_QUEUE.unshift({ videoId: videoId, title: recommCard.find(".title").text() });
  updatePlayQueue();
}

function addToQueue(e) {
  e.stopPropagation();
  recommCard = $(e.target).closest(".recomm-result");
  videoId = recommCard.attr("data-id");
  SONGS_QUEUE.push({ videoId: videoId, title: recommCard.find(".title").text() });
  updatePlayQueue();
}

$("#player").on("ended", playNextVideo)

function playNextVideo() {
  if (SONGS_QUEUE.length > 0) {
    current_video_id = SONGS_QUEUE.shift()["videoId"];
    playsong("", "js");
  }
  updatePlayQueue();
}

function updatePlayQueue() {
  $(".play-queue .queue-item:not(.hidden)").remove();
  SONGS_QUEUE.forEach((song, index) => {
    queueItem = $(".play-queue .queue-item.hidden").clone();
    queueItem.removeClass("hidden");
    queueItem.find(".info").text(song["title"]);
    queueItem.attr("data-id", song["videoId"]);
    queueItem.find(".remove").click(function (e) {
      e.stopPropagation();
      SONGS_QUEUE.splice(index, 1);
      updatePlayQueue();
    });
    queueItem.appendTo(".queue-items");
  });
}