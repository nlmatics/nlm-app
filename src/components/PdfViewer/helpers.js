export const getHilightAllPhrasesCssRule = labelConfig => {
  return Object.keys(labelConfig)
    .map(key => {
      const color = labelConfig[key].color;
      const selectorClassName = `nlm-pdf-hilight-color${color.replace(
        '#',
        '-'
      )}`;
      return selectorClassName;
    })
    .join(' ');
};

export const getDefaultHilightPhrasesCssRule = labelConfig => {
  return Object.keys(labelConfig)
    .map(key => {
      const { color, defaultHilight } = labelConfig[key];
      return defaultHilight
        ? `nlm-pdf-hilight-color${color.replace('#', '-')}`
        : '';
    })
    .join(' ');
};

export const getHilightClassName = entityType =>
  `nlm-pdf-hilight-${entityType.toLowerCase().split(':').join('-')}`;

export const getHilightCssRules = (labelConfig, opacity = '52') => {
  return Object.keys(labelConfig).map(key => {
    const hilightClassName = getHilightClassName(key);
    const color = labelConfig[key].color;
    const selectorClassName = `nlm-pdf-hilight-color${color.replace('#', '-')}`;
    return `.${selectorClassName} .${hilightClassName} { background-color: ${labelConfig[key].color}${opacity}; }`;
  });
};

export const getPositionResetCssRule = labelConfig => {
  return Object.keys(labelConfig).map(key => {
    const hilightClassName = getHilightClassName(key);
    return `span.${hilightClassName} { position: static !important; }`;
  });
};

export const getHideControlsCssRule = () =>
  `#toolbarSidebar, #thumbnailView, #outlineView, #attachmentsView, #layersView, #sidebarContent, #sidebarResizer {display: none }
  #viewFind { left: 157px }
  #toolbarViewerLeft .splitToolbarButton, #pageNumber, #numPages { left: -50px }
  #findbar { left: 221px }
   `;
