// Shared API config and helper
(function (global) {
  const API_BASE = 'https://dashboard.inkpactmm.org';

  function toAbsolute(p) {
    if (!p) return p;
    if (typeof p !== 'string') return p;
    if (p.startsWith('http') || p.startsWith('//')) return p;
    if (p.startsWith('/')) return API_BASE + p;
    return API_BASE + '/' + p.replace(/^\.\/?/, '');
  }

  global.API_BASE = API_BASE;
  global.toAbsolute = toAbsolute;
})(window);
