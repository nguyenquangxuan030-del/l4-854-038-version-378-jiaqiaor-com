(function () {
  function attachPlayer(root) {
    var video = root.querySelector('.js-video');
    var button = root.querySelector('.js-play-button');
    var message = root.querySelector('.js-player-message');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add('is-visible');
    }

    function initialize() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;

      if (!source) {
        showMessage('当前影片暂未配置播放源。');
        return Promise.reject(new Error('missing source'));
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      showMessage('当前浏览器不支持 HLS 播放，请换用支持 M3U8 的浏览器。');
      return Promise.reject(new Error('hls unsupported'));
    }

    button.addEventListener('click', function () {
      initialize()
        .then(function () {
          button.classList.add('is-hidden');
          return video.play();
        })
        .catch(function () {
          button.classList.remove('is-hidden');
        });
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
