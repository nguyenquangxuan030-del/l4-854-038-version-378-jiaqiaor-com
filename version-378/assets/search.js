(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"corner-label\">" + escapeHtml(movie.type) + "</span>" +
      "<span class=\"duration-label\">" + escapeHtml(movie.duration) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>热度 " + escapeHtml(movie.views) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  ready(function () {
    var data = window.MOVIE_INDEX || [];
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");

    if (!input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var term = String(query || "").trim().toLowerCase();
      var list = data.filter(function (movie) {
        if (!term) {
          return true;
        }
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();
        return haystack.indexOf(term) !== -1;
      }).slice(0, term ? 120 : 60);

      if (title) {
        title.textContent = term ? "搜索结果：" + query : "热门影片推荐";
      }
      results.innerHTML = list.map(card).join("");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", url);
        render(query);
      });
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initial);
  });
})();
