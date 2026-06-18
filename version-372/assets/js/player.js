(function () {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playerOverlay');
  var source = window.__MOVIE_SOURCE__ || '';
  var hls = null;
  var ready = false;

  if (!video || !source) {
    return;
  }

  function bindVideo() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    video.setAttribute('controls', 'controls');
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay && video.paused) {
      overlay.classList.remove('is-hidden');
    }
  }

  function playVideo() {
    bindVideo();
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showOverlay();
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', showOverlay);
  video.addEventListener('ended', showOverlay);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
