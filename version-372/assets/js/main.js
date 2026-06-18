(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function fillFilterOptions(panel, cards) {
    var regionSelect = qs('[data-filter-region]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var yearSelect = qs('[data-filter-year]', panel);

    function uniqueValues(name) {
      var values = cards.map(function (card) {
        return card.getAttribute(name) || '';
      }).filter(Boolean);
      return Array.from(new Set(values)).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN');
      });
    }

    function addOptions(select, values) {
      if (!select || select.options.length > 1) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    addOptions(regionSelect, uniqueValues('data-region'));
    addOptions(typeSelect, uniqueValues('data-type'));
    addOptions(yearSelect, uniqueValues('data-year'));
  }

  function initFilters(root) {
    qsa('[data-filter-panel]', root || document).forEach(function (panel) {
      var scope = panel.parentElement || document;
      var grid = qs('[data-filter-grid]', scope) || qs('[data-search-results]', scope);
      if (!grid) {
        return;
      }
      var input = qs('[data-filter-input]', panel);
      var region = qs('[data-filter-region]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var reset = qs('[data-filter-reset]', panel);
      var result = qs('[data-filter-result]', panel);
      var cards = qsa('[data-movie-card]', grid);

      fillFilterOptions(panel, cards);

      function apply() {
        var q = normalize(input && input.value);
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (regionValue && card.getAttribute('data-region') !== regionValue) {
            ok = false;
          }
          if (typeValue && card.getAttribute('data-type') !== typeValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            ok = false;
          }
          card.classList.toggle('is-hidden-by-filter', !ok);
          if (ok) {
            shown += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + shown + ' 部影片';
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (region) {
            region.value = '';
          }
          if (type) {
            type.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }
      apply();
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(' · ');
    return [
      '<article class="movie-card" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-tags="' + escapeHtml((movie.tags || []).join(' ') + ' ' + movie.genre) + '">',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-gradient"></span>',
      '    <span class="quality-badge">高清</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <p class="movie-tags">' + escapeHtml(tags || movie.genre) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }
    var form = qs('[data-search-page-form]');
    var input = qs('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render() {
      var q = normalize(input && input.value);
      var movies = window.SITE_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return !q || haystack.indexOf(q) !== -1;
      });
      results.innerHTML = movies.slice(0, 240).map(movieCardTemplate).join('');
      initFilters(results.parentElement);
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
        var nextUrl = window.location.pathname + '?q=' + encodeURIComponent(input ? input.value : '');
        window.history.replaceState(null, '', nextUrl);
      });
    }
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters(document);
    initSearchPage();
  });
})();
