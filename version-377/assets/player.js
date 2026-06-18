(function () {
  window.initMoviePlayer = function (mediaSource) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-player-overlay]');
    var loaded = false;
    var hls = null;

    if (!video) {
      return;
    }

    function loadMedia() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaSource;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(mediaSource);
        hls.attachMedia(video);
      } else {
        video.src = mediaSource;
      }
    }

    function start() {
      loadMedia();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
