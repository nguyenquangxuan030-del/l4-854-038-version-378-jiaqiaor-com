(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function queueNext() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      queueNext();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      queueNext();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      queueNext();
    });
  }

  queueNext();

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var primarySearch = document.querySelector('[data-filter-search]');
  var secondarySearch = document.querySelector('[data-filter-search-secondary]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function fillSelect(select, attribute) {
    if (!select || !cards.length) {
      return;
    }

    var values = [];
    cards.forEach(function (card) {
      String(card.getAttribute(attribute) || '')
        .split(/[，,、/\s]+/)
        .map(function (item) { return item.trim(); })
        .filter(Boolean)
        .forEach(function (item) {
          if (values.indexOf(item) === -1) {
            values.push(item);
          }
        });
    });

    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });

    values.slice(0, 80).forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(regionSelect, 'data-region');
  fillSelect(yearSelect, 'data-year');
  fillSelect(genreSelect, 'data-genre');

  function queryFromLocation() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  var initialQuery = queryFromLocation();
  if (initialQuery && primarySearch) {
    primarySearch.value = initialQuery;
  }

  function activeQuery() {
    var primary = primarySearch ? primarySearch.value : '';
    var secondary = secondarySearch ? secondarySearch.value : '';
    return normalize(primary + ' ' + secondary);
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-year'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = activeQuery();
    var region = normalize(regionSelect ? regionSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var genre = normalize(genreSelect ? genreSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var regionValue = normalize(card.getAttribute('data-region'));
      var yearValue = normalize(card.getAttribute('data-year'));
      var genreValue = normalize(card.getAttribute('data-genre'));
      var match = true;

      if (query && text.indexOf(query) === -1) {
        match = false;
      }
      if (region && regionValue.indexOf(region) === -1) {
        match = false;
      }
      if (year && yearValue !== year) {
        match = false;
      }
      if (genre && genreValue.indexOf(genre) === -1) {
        match = false;
      }

      card.hidden = !match;
      if (match) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [primarySearch, secondarySearch, regionSelect, yearSelect, genreSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
