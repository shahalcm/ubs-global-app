const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.mainFields = ['main', 'module', 'browser'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'ts', 'tsx'];

module.exports = config;
