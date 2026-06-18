(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            show(index + 1);
          }, 5200);
        }
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panelElement) {
      var keyword = panelElement.querySelector("[data-filter-keyword]");
      var type = panelElement.querySelector("[data-filter-type]");
      var year = panelElement.querySelector("[data-filter-year]");
      var sort = panelElement.querySelector("[data-filter-sort]");
      var grid = document.querySelector("[data-card-grid]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

      function applyFilters() {
        var term = (keyword && keyword.value ? keyword.value : "").trim().toLowerCase();
        var typeValue = type && type.value ? type.value : "";
        var yearValue = year && year.value ? year.value : "";
        var visibleCards = [];

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchesKeyword = !term || haystack.indexOf(term) !== -1;
          var matchesType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var visible = matchesKeyword && matchesType && matchesYear;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            visibleCards.push(card);
          }
        });

        var sortValue = sort && sort.value ? sort.value : "default";
        if (sortValue !== "default") {
          visibleCards.sort(function (a, b) {
            return Number(b.getAttribute("data-" + sortValue) || 0) - Number(a.getAttribute("data-" + sortValue) || 0);
          });
          visibleCards.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      }

      [keyword, type, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    });
  });
})();
