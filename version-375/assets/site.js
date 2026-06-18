(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var backTop = qs('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }

      showSlide(dotIndex);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterInput = qs('[data-filter-input]');
  var filterButtons = qsa('[data-filter-button]');
  var cards = qsa('[data-card]');

  function applyCardFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var activeButton = qs('[data-filter-button].is-active');
    var activeValue = activeButton ? activeButton.getAttribute('data-filter-button') : 'all';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();

      var categoryMatch = activeValue === 'all' || text.indexOf(activeValue.toLowerCase()) !== -1;
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = categoryMatch && keywordMatch ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCardFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      applyCardFilter();
    });
  });
})();
