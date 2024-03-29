const path = require('path');
const fs = require('fs');

const { generateTheme } = require('antd-theme-generator');
const { render } = require('less');

const getOptions = theme => ({
  stylesDir: path.join(__dirname, './base'),
  antDir: path.join(__dirname, './node_modules/antd'),
  varFile: path.join(__dirname, './src/styles/vars.less'),
  generateOnce: true,
  rootEntryName: theme,
});

const buildThemes = async () => {
  let theme = 'light';
  // const lightThemeLess = await generateTheme(getOptions('default'));
  // const { css: lightCss } = await render(lightThemeLess, {
  //   javascriptEnabled: true,
  //   compress: true,
  // });
  // fs.writeFileSync(`./public/css/nlm-${theme}.css`, lightCss);

  theme = 'dark';
  const darkThemeLess = await generateTheme(getOptions(theme));
  const { css: darkCss } = await render(darkThemeLess, {
    javascriptEnabled: true,
    compress: true,
  });
  fs.writeFileSync(`./public/css/nlm-${theme}.css`, darkCss);
};

buildThemes();
