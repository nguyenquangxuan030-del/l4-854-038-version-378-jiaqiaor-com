(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSiteSearch() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function setActive(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function next() {
      setActive(active + 1);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setActive(i);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(next, 5000);
      });
    });

    setActive(0);
    timer = setInterval(next, 5000);
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function initFilters() {
    var filterInput = qs('[data-card-filter]');
    var yearSelect = qs('[data-year-filter]');
    var categorySelect = qs('[data-category-filter]');
    var cards = qsa('.movie-card[data-title]');
    var noResults = qs('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (filterInput && query) {
      filterInput.value = query;
    }

    if (!filterInput && !yearSelect && !categorySelect) {
      return;
    }

    function applyFilter() {
      var text = normalize(filterInput ? filterInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchCategory = !category || card.getAttribute('data-category') === category;
        var show = matchText && matchYear && matchCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  function initBackTop() {
    var button = document.createElement('button');
    button.className = 'back-top';
    button.type = 'button';
    button.setAttribute('aria-label', '返回顶部');
    button.textContent = '↑';
    document.body.appendChild(button);

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 420);
    });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupMoviePlayer(videoId, url) {
    var video = document.getElementById(videoId);
    var overlay = qs('[data-player-overlay]');
    if (!video || !url) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    }

    function start() {
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSiteSearch();
    initHeroSlider();
    initFilters();
    initBackTop();
    if (window.__playEntry) {
      setupMoviePlayer(window.__playEntry.id, window.__playEntry.url);
    }
  });
})();
