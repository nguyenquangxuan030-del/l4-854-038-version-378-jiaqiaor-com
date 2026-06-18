(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setSlide(i);
    });
  });

  if (slides.length) {
    setSlide(0);
    window.setInterval(function () {
      setSlide(activeIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-text]'));

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  var resultsBox = document.querySelector('[data-search-results]');
  var searchForm = document.querySelector('[data-search-page-form]');
  var searchInput = document.querySelector('[data-search-page-input]');

  function cardTemplate(movie) {
    return '<article class="movie-card-wrap">' +
      '<a class="movie-card" href="' + movie.url + '">' +
      '<span class="poster-box">' +
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">' +
      '<span class="poster-shade"></span>' +
      '<span class="card-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="card-time">' + escapeHtml(movie.duration) + '</span>' +
      '</span>' +
      '<span class="card-content">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<em>' + escapeHtml(movie.description) + '</em>' +
      '<span class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></span>' +
      '</span>' +
      '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(query) {
    if (!resultsBox || !window.SITE_MOVIES) {
      return;
    }
    var keyword = String(query || '').trim().toLowerCase();
    if (!keyword) {
      resultsBox.innerHTML = '<div class="search-empty">输入片名、地区、类型或标签即可开始搜索。</div>';
      return;
    }
    var list = window.SITE_MOVIES.filter(function (movie) {
      return movie.search.indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (!list.length) {
      resultsBox.innerHTML = '<div class="search-empty">没有找到匹配的影片，换个关键词试试。</div>';
      return;
    }
    resultsBox.innerHTML = '<div class="movie-grid compact">' + list.map(cardTemplate).join('') + '</div>';
  }

  if (resultsBox) {
    var params = new URLSearchParams(window.location.search);
    var currentQuery = params.get('q') || '';
    if (searchInput) {
      searchInput.value = currentQuery;
    }
    runSearch(currentQuery);
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      runSearch(query);
    });
  }
})();
