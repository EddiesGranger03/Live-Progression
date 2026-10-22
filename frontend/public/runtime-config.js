(() => {
  const nativeAssetOrigin = location.hostname === 'localhost';
  window.SOLO_CONFIG = window.SOLO_CONFIG || {
    mode: nativeAssetOrigin ? 'demo' : 'server',
    api: '/api/v1'
  };
})();
