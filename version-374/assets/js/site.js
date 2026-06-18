(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = panel.hasAttribute("hidden") === false;
      if (isOpen) {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
        dot.setAttribute("aria-pressed", dotIndex === current ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = panel.parentElement;
      var items = Array.prototype.slice.call(root.querySelectorAll(".filter-item"));
      var empty = root.querySelector(".empty-state");
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize(
            [
              item.getAttribute("data-title"),
              item.getAttribute("data-region"),
              item.getAttribute("data-year"),
              item.getAttribute("data-type"),
              item.getAttribute("data-genre")
            ].join(" ")
          );

          var ok = true;
          ok = ok && (!q || haystack.indexOf(q) !== -1);
          ok = ok && (!y || normalize(item.getAttribute("data-year")) === y);
          ok = ok && (!r || normalize(item.getAttribute("data-region")) === r);
          ok = ok && (!t || normalize(item.getAttribute("data-type")) === t);

          item.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [keyword, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.SiteMovieIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var input = root.querySelector("[data-search-input]");
    var results = root.querySelector("[data-search-results]");
    var empty = root.querySelector(".empty-state");

    if (input) {
      input.value = q;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function card(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster" href="./' + escapeHtml(item.url) + '">',
        '    <img src="./' + escapeHtml(item.cover) + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-glow"></span>',
        '    <span class="poster-badge">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <h3><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join("\n");
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function render(value) {
      var query = normalize(value);
      var data = window.SiteMovieIndex;
      var list = query
        ? data.filter(function (item) {
            var haystack = normalize([
              item.title,
              item.region,
              item.type,
              item.year,
              item.genre,
              item.category,
              item.oneLine
            ].join(" "));
            return haystack.indexOf(query) !== -1;
          })
        : data.slice(0, 60);

      list = list.slice(0, 120);
      if (results) {
        results.innerHTML = list.map(card).join("\n");
      }
      if (empty) {
        empty.classList.toggle("show", list.length === 0);
      }
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    render(q);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay button");
      var source = shell.getAttribute("data-video-url");

      if (!video || !source) {
        return;
      }

      function loadSource() {
        if (shell.getAttribute("data-ready") === "true") {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsController = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        shell.setAttribute("data-ready", "true");
      }

      function play() {
        loadSource();
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", toggle);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    });
  }

  function setupBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) {
      return;
    }

    function sync() {
      button.classList.toggle("show", window.scrollY > 420);
    }

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
    setupBackToTop();
  });
})();
