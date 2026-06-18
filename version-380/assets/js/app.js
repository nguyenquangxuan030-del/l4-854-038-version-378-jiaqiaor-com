(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLibraryTools();
    setupSearchPage();
    setupPlayers();
  });

  function setupMobileMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('[data-menu-button]');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      header.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', header.classList.contains('is-open'));
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupLibraryTools() {
    var toolbars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-toolbar]'));
    toolbars.forEach(function (toolbar) {
      var grid = document.querySelector('[data-card-grid]');
      var input = toolbar.querySelector('[data-card-filter]');
      var sort = toolbar.querySelector('[data-card-sort]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var original = cards.slice();

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          card.hidden = query && text.indexOf(query) === -1;
        });
        var ordered = original.slice();
        if (sort && sort.value !== 'default') {
          ordered.sort(function (a, b) {
            var key = sort.value;
            var left = Number(a.getAttribute('data-' + key) || 0);
            var right = Number(b.getAttribute('data-' + key) || 0);
            return right - left;
          });
        }
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (sort) {
        sort.addEventListener('change', apply);
      }
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MovieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var empty = document.querySelector('[data-empty-state]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      if (empty) {
        empty.classList.remove('is-hidden');
      }
      return;
    }
    var tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.MovieSearchIndex.filter(function (item) {
      var haystack = [
        item.title,
        item.category,
        item.year,
        item.region,
        item.genre,
        item.summary,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return tokens.every(function (token) {
        return haystack.indexOf(token) !== -1;
      });
    }).sort(function (a, b) {
      return b.heat - a.heat;
    }).slice(0, 120);
    if (title) {
      title.textContent = '“' + query + '”的搜索结果';
    }
    if (matched.length) {
      if (empty) {
        empty.classList.add('is-hidden');
      }
      results.innerHTML = matched.map(renderSearchCard).join('');
    } else if (empty) {
      empty.classList.remove('is-hidden');
      empty.querySelector('h2').textContent = '未找到相关影片';
      empty.querySelector('p').textContent = '可以尝试更换片名、类型、地区或年份继续搜索。';
    }
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="card-poster" href="' + escapeAttribute(item.href) + '">',
      '    <img src="' + escapeAttribute(item.image) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy">',
      '    <span class="badge badge-red">' + escapeHtml(item.category) + '</span>',
      '    <span class="badge badge-dark">' + escapeHtml(item.score) + '分</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a class="card-title" href="' + escapeAttribute(item.href) + '">' + escapeHtml(item.title) + '</a>',
      '    <p>' + escapeHtml(item.summary) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.genre) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('[data-player-video]');
      var button = shell.querySelector('[data-play-overlay]');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var attached = false;

      function attach() {
        if (attached || !stream) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1600);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          var action = video.play();
          if (action && typeof action.catch === 'function') {
            action.catch(function () {});
          }
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
