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
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatNumber(value) {
    var number = Number(value) || 0;
    if (number >= 10000) {
      return (number / 10000).toFixed(1) + "万";
    }
    return String(number);
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", nav.classList.contains("open"));
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  function setupCategoryFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-local-filter]");
      var select = scope.querySelector("[data-sort-select]");
      var grid = scope.querySelector("[data-card-grid]");
      var count = scope.querySelector("[data-filter-count]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var sort = select ? select.value : "default";
        var visibleCards = [];

        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year
          ].join(" ").toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          card.hidden = !matched;

          if (matched) {
            visibleCards.push(card);
          }
        });

        if (sort !== "default") {
          visibleCards.sort(function (a, b) {
            if (sort === "year-desc") {
              return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            if (sort === "views-desc") {
              return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            }
            if (sort === "title-asc") {
              return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
            }
            return 0;
          });
          visibleCards.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (count) {
          count.textContent = visibleCards.length + " 部影片";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = page.querySelector("[data-search-input]");
    var results = page.querySelector("[data-search-results]");
    var summary = page.querySelector("[data-search-summary]");
    var data = window.MOVIE_SEARCH_DATA || [];

    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function movieMatches(movie, keyword) {
      var joined = [
        movie.title,
        movie.description,
        movie.genre,
        movie.region,
        movie.type,
        movie.year,
        movie.tags,
        movie.categoryName
      ].join(" ");
      return normalize(joined).indexOf(keyword) !== -1;
    }

    function createCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <span class="poster-frame">',
        '      <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="poster-gradient"></span>',
        '      <span class="poster-category">' + escapeHtml(movie.categoryName) + '</span>',
        '      <span class="poster-duration">' + escapeHtml(movie.duration) + '</span>',
        '    </span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="movie-meta-row">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <div class="movie-stat-row">',
        '      <span>👁 ' + formatNumber(movie.views) + '</span>',
        '      <span>❤ ' + formatNumber(movie.likes) + '</span>',
        '      <span>' + escapeHtml(movie.genre) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    var keyword = query.trim().toLowerCase();
    var matched = keyword ? data.filter(function (movie) {
      return movieMatches(movie, keyword);
    }) : [];

    if (summary) {
      if (keyword) {
        summary.textContent = '关键词 “' + query + '” 找到 ' + matched.length + ' 个结果';
      } else {
        summary.textContent = '请输入关键词开始搜索。';
      }
    }

    if (results) {
      if (matched.length > 0) {
        results.innerHTML = matched.map(createCard).join("");
      } else if (keyword) {
        results.innerHTML = '<div class="detail-card"><h2>未找到相关内容</h2><p>可以尝试更换片名、地区、类型、年份或标签关键词。</p></div>';
      } else {
        results.innerHTML = '';
      }
    }
  }

  function setupMoviePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-movie-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector("[data-play-button]");
      var sourceInput = player.querySelector("[data-video-src]");
      var message = player.querySelector("[data-player-message]");
      var source = sourceInput ? sourceInput.value : "";
      var hls = null;
      var initialized = false;

      if (!video || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function initializeSource() {
        if (initialized) {
          return;
        }

        initialized = true;
        setMessage("正在初始化播放源...");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage("");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放源加载失败，请稍后重试或更换浏览器。 ");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setMessage("");
          }, { once: true });
        } else {
          video.src = source;
          setMessage("当前浏览器可能不支持 HLS，请使用最新版浏览器访问。 ");
        }
      }

      function playVideo() {
        initializeSource();
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。 ");
          });
        }
      }

      if (playButton) {
        playButton.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupCategoryFilters();
    setupSearchPage();
    setupMoviePlayers();
  });
})();
