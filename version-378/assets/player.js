(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll(".video-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var videoUrl = player.getAttribute("data-video");
      var initialized = false;
      var instance = null;

      function init() {
        if (initialized || !video || !videoUrl) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(videoUrl);
          instance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
      }

      function play() {
        init();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (instance && typeof instance.destroy === "function") {
          instance.destroy();
        }
      });
    });
  });
})();
