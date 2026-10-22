/*
 * IlyaPoint app kit, for HTML apps embedded in slides (<div class="ip-el ip-embed"><iframe src="apps/…">).
 * Include it from the app page, relative to it:  <script src="../../ilyapoint/app.js"></script>
 *
 * - Theme: sets <html data-theme="dark|light"> and the deck's color variables (--ip-fg, --ip-bg, --ip-gray, --ip-red,
 *   --ip-orange, --ip-yellow, --ip-green, --ip-blue, --ip-purple) and Arial, so the app matches the slides.
 * - ilyapoint.active: whether the app's slide is showing. Pause animations / heavy work while it isn't.
 * - ilyapoint.on('active', fn) and ilyapoint.on('theme', fn): called now and on every change.
 * - Slide-navigation keys pressed inside the app (arrows, PageUp/PageDown, Home/End, Escape, and Space unless the
 *   app handles it) are passed to the player, so the talk keeps working after clicking into the app. Call
 *   e.preventDefault() in your own keydown handler to keep a key.
 */
(function () {
  if (window.ilyapoint) return;
  var NAV = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '];
  var embedded = window.parent !== window;
  var fns = { active: [], theme: [] };
  var api = {
    active: !embedded,
    theme: 'dark',
    on: function (ev, fn) {
      if (!fns[ev]) return api;
      fns[ev].push(fn);
      fn(api[ev]);
      return api;
    },
  };
  var emit = function (ev) {
    fns[ev].forEach(function (fn) {
      fn(api[ev]);
    });
  };

  // Standalone defaults (dark theme); the deck overrides them once embedded.
  var style = document.createElement('style');
  style.textContent =
    ':root{--ip-fg:#fff;--ip-bg:#000;--ip-gray:#8e8e93;--ip-red:#ff453a;--ip-orange:#ff9f0a;--ip-yellow:#ffd60a;' +
    '--ip-green:#30d158;--ip-blue:#0a84ff;--ip-purple:#bf5af2;font-family:Arial,"Helvetica Neue",Helvetica,sans-serif}' +
    ':root[data-theme=light]{--ip-fg:#000;--ip-bg:#fff;--ip-red:#e0281e;--ip-orange:#f08c00;--ip-yellow:#e8b800;' +
    '--ip-green:#1fa74a;--ip-blue:#006ee6;--ip-purple:#9b3fd1}';
  (document.head || document.documentElement).prepend(style);
  document.documentElement.setAttribute('data-theme', api.theme);

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.source !== window.parent || !d || d.ilyapoint !== 'state') return;
    var root = document.documentElement;
    for (var k in d.vars || {}) if (d.vars[k]) root.style.setProperty(k, d.vars[k]);
    if (d.theme && d.theme !== api.theme) {
      api.theme = d.theme;
      root.setAttribute('data-theme', d.theme);
      emit('theme');
    }
    if (typeof d.active === 'boolean' && d.active !== api.active) {
      api.active = d.active;
      emit('active');
    }
  });

  window.addEventListener('keydown', function (e) {
    if (!embedded || e.defaultPrevented || NAV.indexOf(e.key) < 0) return;
    var t = e.target;
    var field = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (field && e.key !== 'Escape') return;
    if (e.key === ' ' && t && /^(BUTTON|A|SUMMARY)$/.test(t.tagName)) return;
    window.parent.postMessage(
      { ilyapoint: 'key', key: e.key, code: e.code, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey },
      '*',
    );
    if (e.key === ' ') e.preventDefault();
  });

  if (embedded) window.parent.postMessage({ ilyapoint: 'hello' }, '*');
  window.ilyapoint = api;
})();
