// 本地建置 release APK 時，預設的 Gradle 記憶體（-Xmx2048m / Metaspace 512m）不夠，
// 會在 KSP 編譯階段 OutOfMemoryError: Metaspace 卡住。expo prebuild 會重新產生
// android/gradle.properties，所以用 config plugin 讓每次 prebuild 都帶上較大的設定。
const { withGradleProperties } = require('expo/config-plugins');

const JVM_ARGS = '-Xmx4096m -XX:MaxMetaspaceSize=1536m';

module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (cfg) => {
    const props = cfg.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'org.gradle.jvmargs'),
    );
    props.push({ type: 'property', key: 'org.gradle.jvmargs', value: JVM_ARGS });
    cfg.modResults = props;
    return cfg;
  });
};
