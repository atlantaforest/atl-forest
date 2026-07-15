(function () {
  'use strict';

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function initSlider(el) {
    var beforeWrap = el.querySelector('.ba-before-wrap');
    var handle = el.querySelector('.ba-handle');
    if (!beforeWrap || !handle) return;

    function setPos(pct) {
      pct = clamp(pct, 4, 96);
      beforeWrap.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
    }

    function posFromClientX(clientX) {
      var rect = el.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onDown(e) {
      e.preventDefault();
      function onMove(ev) {
        var x = ev.touches ? ev.touches[0].clientX : ev.clientX;
        setPos(posFromClientX(x));
      }
      function onUp() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: false });
  }

  document.querySelectorAll('.ba-slider').forEach(initSlider);

  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
    });
  });

  var form = document.querySelector('#quote-form');
  if (form) {
    var formWrap = document.querySelector('#quote-form-wrap');
    var successWrap = document.querySelector('#quote-form-success');
    var errorEl = document.querySelector('#form-error');
    var submitBtn = form.querySelector('.form-submit');
    var resendBtn = document.querySelector('#send-another');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            formWrap.hidden = true;
            successWrap.hidden = false;
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          errorEl.hidden = false;
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'SEND QUOTE REQUEST';
        });
    });

    if (resendBtn) {
      resendBtn.addEventListener('click', function () {
        form.reset();
        formWrap.hidden = false;
        successWrap.hidden = true;
      });
    }
  }
})();
