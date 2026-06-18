(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initBackToTop() {
    var button = qs('[data-back-to-top]');

    if (!button) {
      return;
    }

    function sync() {
      button.classList.toggle('is-visible', window.scrollY > 460);
    }

    window.addEventListener('scroll', sync, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    sync();
  }

  function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);

        if (window.Hls) {
          resolve();
        }

        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var playButton = qs('[data-play-button]', box);
      var tip = qs('[data-player-tip]', box);
      var source = box.getAttribute('data-src');
      var hasStarted = false;

      if (!video || !playButton || !source) {
        return;
      }

      function setTip(text) {
        if (tip) {
          tip.textContent = text;
        }
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {
          setTip('浏览器已加载播放源，请点击视频控件继续播放。');
        });
      }

      function playWithHls() {
        if (!window.Hls || !window.Hls.isSupported()) {
          setTip('当前浏览器暂不支持该 HLS 播放源。');
          return;
        }

        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setTip('播放源已加载，请点击视频控件继续播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            setTip('播放源加载失败，请稍后刷新重试。');
          }
        });
      }

      function startPlayer() {
        if (hasStarted) {
          video.play();
          return;
        }

        hasStarted = true;
        box.classList.add('is-playing');
        setTip('正在初始化播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          playWithHls();
          return;
        }

        loadScriptOnce('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
          .then(playWithHls)
          .catch(function () {
            setTip('HLS 播放器加载失败，请检查网络后重试。');
          });
      }

      playButton.addEventListener('click', startPlayer);
    });
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initCatalogFilter() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');

    if (!panel || !grid) {
      return;
    }

    var input = qs('[data-filter-input]', panel);
    var category = qs('[data-filter-category]', panel);
    var type = qs('[data-filter-type]', panel);
    var year = qs('[data-filter-year]', panel);
    var count = qs('[data-filter-count]', panel);
    var cards = qsa('.movie-card', grid);

    function matchYear(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }

      if (selectedYear === '2022') {
        return Number(cardYear) <= 2022;
      }

      return String(cardYear) === selectedYear;
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var selectedCategory = category ? category.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }

        if (selectedCategory && card.getAttribute('data-category') !== selectedCategory) {
          ok = false;
        }

        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          ok = false;
        }

        if (!matchYear(card.getAttribute('data-year'), selectedYear)) {
          ok = false;
        }

        card.classList.toggle('is-hidden-by-filter', !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '正在显示 ' + visible + ' 部影片';
      }
    }

    [input, category, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card movie-card--compact">',
      '  <a href="detail/' + movie.id + '.html" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="play-mark" aria-hidden="true">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="movie-meta-line">',
      '        <span>' + escapeHtml(movie.yearText) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '      <div class="card-bottom">',
      '        <strong>' + Number(movie.rating).toFixed(1) + '</strong>',
      '        <span>' + escapeHtml(movie.categoryName) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');

    if (!page || !window.MOVIE_DATA) {
      return;
    }

    var input = qs('[data-search-input]', page);
    var results = qs('[data-search-results]', page);
    var status = qs('[data-search-status]', page);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function render(query) {
      var keyword = normalize(query);
      var matched = [];

      if (keyword) {
        matched = window.MOVIE_DATA.filter(function (movie) {
          return normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.yearText,
            movie.genreRaw,
            movie.oneLine,
            (movie.tags || []).join(' '),
            movie.categoryName
          ].join(' ')).indexOf(keyword) !== -1;
        }).slice(0, 120);
      }

      results.innerHTML = matched.map(createSearchCard).join('');

      if (!keyword) {
        status.textContent = '请输入关键词开始搜索。';
      } else {
        status.textContent = '共找到 ' + matched.length + ' 条相关结果。';
      }
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(initialQuery);
  }

  function initImageFallback() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.parentElement && image.parentElement.classList.add('is-missing-image');
      }, { once: true });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initBackToTop();
    initPlayers();
    initCatalogFilter();
    initSearchPage();
    initImageFallback();
  });
}());
