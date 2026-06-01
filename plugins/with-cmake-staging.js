const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withCMakeStaging(config) {
  // Only apply on Windows local builds where MAX_PATH is an issue.
  // EAS Build (Linux) and macOS do not suffer from the 260 character path limit.
  if (process.platform !== 'win32') {
    return config;
  }

  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const customCode = `
subprojects {
  afterEvaluate { project ->
    if (project.hasProperty("android")) {
      project.android {
        externalNativeBuild {
          cmake {
            // Redirect CMake staging/build directory to a shorter path on C:\\ drive
            // to bypass the Windows MAX_PATH (260 character) limit during C++ compilation.
            setBuildStagingDirectory(new File("C:/ubs-cxx/\${project.name}"))
          }
        }
      }
    }
  }
}
`;
      if (!config.modResults.contents.includes('C:/ubs-cxx/')) {
        config.modResults.contents += customCode;
      }
    }
    return config;
  });
};
