(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-query]');
  var select = document.querySelector('[data-search-type]');
  var grid = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var movies = window.MOVIES_INDEX || [];
  var params = new URLSearchParams(window.location.search);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="cover-link" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function matches(movie, query, type) {
    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' ').toLowerCase();

    var queryMatch = !query || text.indexOf(query.toLowerCase()) !== -1;
    var typeMatch = !type || type === 'all' || text.indexOf(type.toLowerCase()) !== -1;

    return queryMatch && typeMatch;
  }

  function render() {
    var query = input ? input.value.trim() : '';
    var type = select ? select.value : 'all';
    var results = movies.filter(function (movie) {
      return matches(movie, query, type);
    });

    if (grid) {
      grid.innerHTML = results.map(movieCard).join('');
    }

    if (empty) {
      empty.classList.toggle('is-visible', results.length === 0);
    }
  }

  if (input) {
    input.value = params.get('q') || '';
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
  }

  if (input) {
    input.addEventListener('input', render);
  }

  if (select) {
    select.addEventListener('change', render);
  }

  render();
})();
