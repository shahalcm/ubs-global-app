const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidCleartext(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    if (androidManifest.manifest && androidManifest.manifest.application) {
      const mainApplication = androidManifest.manifest.application[0];
      if (mainApplication && mainApplication.$) {
        mainApplication.$['android:usesCleartextTraffic'] = 'true';
      }
    }
    return config;
  });
};
