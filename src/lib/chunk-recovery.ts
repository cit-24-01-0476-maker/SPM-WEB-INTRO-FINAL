// Runs before the module entry, including when its first lazy import fails.
// Limit automatic refreshes so network outages cannot create a reload loop.
export const chunkRecoveryScript = `(function(){
  var refreshing = false;
  window.addEventListener('vite:preloadError', function(event){
    if (refreshing || !navigator.onLine) return;
    try {
      var key = 'spm-chunk-recovery';
      var now = Date.now();
      var previous = Number(sessionStorage.getItem(key) || 0);
      if (now - previous < 60000) return;
      sessionStorage.setItem(key, String(now));
    } catch (_) { return; }
    refreshing = true;
    event.preventDefault();
    window.location.reload();
  });
})();`;
