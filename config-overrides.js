const {
  override,
  fixBabelImports,
  addLessLoader,
  addBundleVisualizer,
} = require('customize-cra');

module.exports = override(
  fixBabelImports('antd', {
    libraryDirectory: 'lib',
    style: false,
  }),
  fixBabelImports('@ant-design/icons', {
    libraryDirectory: 'lib/icons',
    style: false,
    camel2DashComponentName: false,
  }),
  addLessLoader({
    javascriptEnabled: true,
  }),
  addBundleVisualizer({ analyzerPort: 8888, analyzerMode: 'server' }, true)
);
