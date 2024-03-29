/* global Konva */
// TODO: Refactor to reduce complexity
(function (window) {
  // nosonar
  'use strict';
  function nlmExtensions() {
    var _nlmObject = {};
    // 'hello world' - phrase
    // 12 - page number
    // {'hello world': {12: {spanStartIndex: 20, spanEndIndex :21}}}
    var pharseVsSpanIndicesMap = {};

    const onElementReady = id =>
      new Promise(resolve => {
        const waitForElement = () => {
          if (document.getElementById(id)) {
            resolve(document.getElementById(id));
          } else {
            window.requestAnimationFrame(waitForElement);
          }
        };
        waitForElement();
      });

    _nlmObject.findInPage = function (pageView, match) {
      console.log('will find in page:', match, pageView);
    };
    _nlmObject.clearOutline = function (pageView) {
      let pageNumber = pageView.id;
      let drawLayerId = 'savedDrawingsLayer-' + pageNumber;
      let drawLayer = document.getElementById(drawLayerId);
      if (drawLayer) {
        var stage = new Konva.Stage({
          container: drawLayer, // id of container <div>
          width: drawLayer.offsetWidth,
          height: drawLayer.offsetHeight,
          opacity: 1.0,
        });
        stage.clear();
      }
    };
    _nlmObject.clearBox = function (pageView) {
      let pageNumber = pageView.id;
      let drawLayerId = 'drawLayer-' + pageNumber;
      let drawLayer = document.getElementById(drawLayerId);
      if (drawLayer) {
        var stage = new Konva.Stage({
          container: drawLayer, // id of container <div>
          width: drawLayer.offsetWidth,
          height: drawLayer.offsetHeight,
          opacity: 1.0,
        });
        stage.clear();
      }
    };

    _nlmObject.drawOutline = function (pageView, layerName, bboxInfos) {
      let pageNumber = pageView.id;
      let drawLayerId = layerName + '-' + pageNumber;
      let drawLayer = document.getElementById(drawLayerId);
      let div = pageView.div;
      if (!drawLayer) {
        drawLayer = document.createElement('div');
        drawLayer.style.width = div.style.width;
        drawLayer.style.height = div.style.height;
        drawLayer.style.position = 'absolute';
        drawLayer.id = layerName + '-' + div.getAttribute('data-page-number');
        drawLayer.classList.add(layerName);
        div.insertBefore(drawLayer, div.children[0]);
      }
      function drawInner() {
        let currentDrawLayer = document.getElementById(drawLayerId);
        let scaleX = pageView.viewport.scale;
        let scaleY = pageView.viewport.scale;

        var stage = new Konva.Stage({
          container: currentDrawLayer, // id of container <div>
          width: currentDrawLayer.offsetWidth,
          height: currentDrawLayer.offsetHeight,
          opacity: 1.0,
        });
        var layer = new Konva.Layer();
        // create our shape
        for (let bboxInfo of bboxInfos) {
          let bbox = bboxInfo.bbox;
          let x = bbox[0] * scaleX;
          let y = bbox[1] * scaleY;
          let width = (bbox[2] - bbox[0]) * scaleX;
          let height = (bbox[3] - bbox[1]) * scaleY;
          var box = new Konva.Rect({
            x: x,
            y: y,
            width: width,
            height: height,
            stroke: bboxInfo.stroke.strokeColor,
            strokeWidth: bboxInfo.stroke.strokeWidth,
            dash: bboxInfo.stroke.strokeDash,
            draggable: false,
            name: 'nlm-saved-label' + bboxInfo.blockId,
          });
          console.log('adding box to layer..', box, bboxInfos);
          layer.add(box);
        }
        // add the layer to the stage
        stage.add(layer);

        // draw the image
        layer.draw();
      }
      onElementReady(drawLayerId).then(() => {
        drawInner();
      });
    };

    _nlmObject.addCssRules = (cssRules, BRAND_COLOR) => {
      console.debug('Adding hilight classes to document.head');
      var style = document.createElement('style');
      style.innerHTML = [
        ...cssRules,
        `.pdfViewer .nlm-pdf-hilight-search-term { background-color: ${BRAND_COLOR}52; padding-bottom: 2px; position: static !important;}`,
        '.pdfViewer .nlm-pdf-hilight-search-keyword { background-color: #ffff0052; padding-bottom: 2px; position: static !important;}',
      ].join(' ');
      document.getElementsByTagName('head')[0].appendChild(style);
    };

    _nlmObject.showReferenceDefinitions = referenceDefinitionsClass => {
      document.querySelector('#viewerContainer #viewer').className +=
        ' ' + referenceDefinitionsClass;
    };

    _nlmObject.hideReferenceDefinitions = referenceDefinitionsClass => {
      document
        .querySelector('#viewerContainer #viewer')
        .classList.remove(referenceDefinitionsClass);
    };

    _nlmObject.hilightAllPhrases = allHilightClasses => {
      document.querySelector('#viewerContainer #viewer').className +=
        ' ' + allHilightClasses;
    };

    _nlmObject.unHilightAllPhrases = className => {
      document.querySelector('#viewerContainer #viewer').className = className;
    };

    _nlmObject.toggleHilightColor = ({ color, checked }) => {
      const hilightClass = `nlm-pdf-hilight-color${color.replace('#', '-')}`;
      const pdfViewerElement = document.querySelector(
        '#viewerContainer #viewer'
      );
      checked
        ? pdfViewerElement.classList.add(hilightClass)
        : pdfViewerElement.classList.remove(hilightClass);
    };

    function addHilightClassForPhrase({
      phrase,
      textLayer,
      searchTermHilightClass,
    }) {
      const spanIndices =
        pharseVsSpanIndicesMap[phrase]?.[textLayer.pageNumber];
      spanIndices.forEach(({ spanStartIndex, spanEndIndex }) => {
        let spanIndex = spanStartIndex;
        while (spanIndex <= spanEndIndex) {
          const span = textLayer.textDivs[spanIndex];
          if (span.className.includes(searchTermHilightClass)) {
            span.classList.add(searchTermHilightClass);
          }

          const innerSpans = span.getElementsByTagName('span');
          Array.prototype.forEach.call(innerSpans, innerSpan => {
            if (
              innerSpan.className.includes(
                phrase.trim().split(' ').length === 1
                  ? `${searchTermHilightClass}-${phrase.split('').join('_')}`
                  : searchTermHilightClass
              )
            ) {
              innerSpan.classList.add(searchTermHilightClass);
            }
          });
          spanIndex += 1;
        }
      });
    }

    _nlmObject.removeHilightClassForPhrase =
      function removeHilightClassForPhrase({
        phrase,
        textLayer,
        searchTermHilightClass,
      }) {
        if (pharseVsSpanIndicesMap[phrase]?.[textLayer.pageNumber]) {
          const spanIndices =
            pharseVsSpanIndicesMap[phrase]?.[textLayer.pageNumber];
          spanIndices.forEach(({ spanStartIndex, spanEndIndex }) => {
            let spanIndex = spanStartIndex;
            while (spanIndex <= spanEndIndex) {
              const span = textLayer.textDivs[spanIndex];
              span.classList.remove(searchTermHilightClass);
              const innerSpans = span.getElementsByTagName('span');

              Array.prototype.forEach.call(innerSpans, innerSpan => {
                innerSpan.classList.remove(searchTermHilightClass);
              });
              spanIndex += 1;
            }
          });
        }
      };

    _nlmObject.hilightPhrase = function ({
      phrase,
      pageView,
      selectedBlock,
      searchTermHilightClass,
    }) {
      const { textLayer } = pageView;
      if (pharseVsSpanIndicesMap[phrase]?.[textLayer.pageNumber]) {
        console.debug(
          `phrase ${phrase} was already hilighted on page ${textLayer.pageNumber}. 
             Directly adding hilight classes for cached spans`
        );
        // phrase is already hilighted use spans and directly add hilight class
        addHilightClassForPhrase({
          phrase,
          textLayer,
          searchTermHilightClass,
        });
      } else {
        const phrasesWithSpans = getPhrasesWithSpans(
          [
            {
              phrase,
              hilightClasses: [
                searchTermHilightClass,
                // this class is further required in addHilightClassForPhrase for includes check
                phrase.trim().split(' ').length === 1
                  ? `${searchTermHilightClass}-${phrase.split('').join('_')}`
                  : `${searchTermHilightClass}-placeholder`,
              ],
            },
          ],
          textLayer
        );
        if (selectedBlock) {
          const spanWithinBbox = findSpanWithinBbox(
            phrasesWithSpans,
            selectedBlock.bbox,
            pageView
          );

          if (spanWithinBbox) {
            addHilightClassesToSpans([spanWithinBbox], textLayer);
          }
        } else {
          addHilightClassesToSpans(phrasesWithSpans, textLayer);
        }
      }
    };

    function findSpanWithinBbox(phrasesWithSpans, bbox, pageView) {
      const tolerance = 25;
      let left = bbox ? Math.floor(bbox[0] * pageView.viewport.scale) : 0;
      let top = bbox ? Math.floor(bbox[1] * pageView.viewport.scale) : 0;
      let right = bbox ? Math.ceil(bbox[2] * pageView.viewport.scale) : 0;
      let bottom = bbox ? Math.ceil(bbox[3] * pageView.viewport.scale) : 0;
      return phrasesWithSpans.find(({ spanStart, spanEnd }) => {
        const { width, height } = spanEnd.getBoundingClientRect();
        return (
          spanStart.offsetLeft + tolerance >= left &&
          spanStart.offsetTop + tolerance >= top &&
          spanEnd.offsetLeft + width - tolerance <= right &&
          spanEnd.offsetTop + height - tolerance <= bottom
        );
      });
    }
    _nlmObject.hilightPhrases = function (phrases, textLayer) {
      console.debug(`Started hilighting ${phrases.length} phrases`);
      const phrasesWithSpans = getPhrasesWithSpans(phrases, textLayer);
      phrasesWithSpans.sort(
        ({ phrase: phraseA }, { phrase: phraseB }) =>
          phraseB.length - phraseA.length
      );

      console.debug({ phrasesWithSpans });
      addHilightClassesToSpans(phrasesWithSpans, textLayer);
    };

    function getPhrasesWithSpans(phrases, textLayer) {
      /*
        phrases = 
        ['Document', 'hilighting', 'interesting', 'Good Luck']

        textLayer.textContentItemsStr = 
        ['The Docu', 'ment ', 'hilighting', ' is an interesting task.', 'Good', 'Luck.']

        pageStringsWithoutSpaces = 
        ['TheDocu', 'ment', 'hilighting', 'isaninterestingtask.', 'Good', 'Luck.']
      */
      const pageStringsWithoutSpaces = textLayer.textContentItemsStr.map(
        itemStr => itemStr.replace(/\s+/g, '')
      );
      /*
          pageStringWithoutSpaces = 
          'TheDocumenthilightingisaninterestingtask.GoodLuck.'
        */
      const pageStringWithoutSpaces = pageStringsWithoutSpaces.join('');

      /*
          positions =
          [{start: 0, end: 7},    // 'TheDocu'
           {start: 7, end: 11},   // 'ment'
           {start: 11, end: 21},  // 'hilighting'
           {start: 21, end: 41},  // 'isaninterestingtask.'
           {start: 41, end: 45},  // 'Good'
           {start: 45, end: 50},  // 'Luck'
          ]
  
        */
      const positions = pageStringsWithoutSpaces.map((text, index, arr) => ({
        start: arr.slice(0, index).join('').length,
        end: arr.slice(0, index).join('').length + text.length,
      }));
      console.debug({ positions });
      const phrasesWithSpans = phrases.flatMap(phraseToBeHilighted => {
        const { phrase } = phraseToBeHilighted;
        const phraseWithoutSpaces = phrase.replace(/\s+/g, '');
        let phrasesWithSpans = [];
        let phraseToHilightStartPosition;
        let searchFromIndex = 0;
        let previousSpanStartIndex = -1;

        while (
          (phraseToHilightStartPosition = pageStringWithoutSpaces.indexOf(
            phraseWithoutSpaces,
            searchFromIndex
          )) > -1
        ) {
          const phraseToHilightEndPosition =
            phraseToHilightStartPosition + phraseWithoutSpaces.length;

          searchFromIndex = phraseToHilightEndPosition;

          const spanStartIndex = positions.findIndex(
            ({ start, end }) =>
              phraseToHilightStartPosition >= start &&
              phraseToHilightStartPosition < end &&
              end !== 0
          );

          if (spanStartIndex === previousSpanStartIndex) {
            previousSpanStartIndex = -1;
            // TODO: Currently not hilighting phrases within the same span.
            break;
          } else {
            previousSpanStartIndex = spanStartIndex;
          }
          const spanEndIndex = positions.findIndex(
            ({ start, end }) =>
              phraseToHilightEndPosition >= start &&
              phraseToHilightEndPosition <= end &&
              end !== 0
          );
          const spanStart = textLayer.textDivs[spanStartIndex];
          const spanEnd = textLayer.textDivs[spanEndIndex];

          let completeSpanString = '';
          let completeSpanStringWithSpace = '';
          if (spanStartIndex !== spanEndIndex) {
            completeSpanString = textLayer.textDivs
              .slice(spanStartIndex, spanEndIndex + 1)
              .map(({ textContent }) => textContent)
              .join('');
            completeSpanStringWithSpace = textLayer.textDivs
              .slice(spanStartIndex, spanEndIndex + 1)
              .map(({ textContent }) => textContent)
              .join(' ')
              .replace(/\s+/g, ' ');
          }

          phrasesWithSpans.push({
            ...phraseToBeHilighted,
            spanStart,
            spanStartTextContent: spanStart?.textContent.replace(/\s+/g, ' '),
            spanStartIndex,
            spanEnd,
            spanEndTextContent: spanEnd?.textContent.replace(/\s+/g, ' '),
            spanEndIndex,
            completeSpanString,
            completeSpanStringWithSpace,
            pageNumber: textLayer.pageNumber,
          });
        }
        return phrasesWithSpans;
      });
      return phrasesWithSpans;
    }
    function addPhraseToCache({
      phrase,
      pageNumber,
      spanStartIndex,
      spanEndIndex,
    }) {
      // store in map to be used later for individual hilighting of phrases
      const existingSpanIndices =
        pharseVsSpanIndicesMap[phrase]?.[pageNumber] || [];
      pharseVsSpanIndicesMap[phrase] = {
        ...(pharseVsSpanIndicesMap[phrase] || {}),
        [pageNumber]: [
          ...existingSpanIndices,
          {
            spanStartIndex,
            spanEndIndex,
          },
        ],
      };
    }
    function getRegexWithStopWords(phrase) {
      return new RegExp(`\\b${String(phrase)}\\b`);
    }
    function addHilightClassesToSpans(phrasesWithSpans, textLayer) {
      function smartlySetInnerHTMLWithInnerSpans(span, innerHTML) {
        // If something goes weirdly wrong and deeply nested, pick only first 20
        const innerSpans = Array.prototype.slice.call(
          span.getElementsByTagName('span'),
          0,
          20
        );
        Array.prototype.forEach.call(innerSpans, innerSpan => {
          innerHTML = innerHTML?.replace(
            innerSpan.textContent,
            innerSpan.outerHTML
          );
        });
        span.innerHTML = innerHTML;
      }

      function smartlySetInnerHTML(span, phrase, innerHTML) {
        span.innerHTML = span.innerHTML.replace(phrase, innerHTML);
      }

      console.debug(`Start hilighting ${phrasesWithSpans.length} occurrences`);
      phrasesWithSpans.forEach(
        ({
          phrase,
          spanStart,
          spanStartTextContent,
          spanStartIndex,
          spanEnd,
          spanEndTextContent,
          spanEndIndex,
          hilightClasses,
          completeSpanString,
          completeSpanStringWithSpace,
          pageNumber,
        }) => {
          if (spanStart && spanStartTextContent) {
            console.debug(`Started hilighting phrase: ${phrase}`);
            try {
              if (phrase === spanStartTextContent) {
                requestAnimationFrame(() =>
                  smartlySetInnerHTML(
                    spanStart,
                    phrase,
                    `<span class="${hilightClasses.join(' ')}">${phrase}</span>`
                  )
                );
                addPhraseToCache({
                  phrase,
                  pageNumber,
                  spanStartIndex,
                  spanEndIndex,
                });
              } else if (
                spanStartTextContent.search(getRegexWithStopWords(phrase)) !==
                -1
              ) {
                if (
                  spanStart.innerHTML.search(getRegexWithStopWords(phrase)) > -1
                ) {
                  smartlySetInnerHTML(
                    spanStart,
                    phrase,
                    `<span class="${hilightClasses.join(' ')}">${phrase}</span>`
                  );
                } else {
                  const [before, after] = spanStartTextContent.split(phrase);
                  const spanInnnerHTML = [
                    before,
                    `<span class="${hilightClasses.join(
                      ' '
                    )}">${phrase}</span>`,
                    after,
                  ].join('');
                  smartlySetInnerHTMLWithInnerSpans(spanStart, spanInnnerHTML);
                }
                addPhraseToCache({
                  phrase,
                  pageNumber,
                  spanStartIndex,
                  spanEndIndex,
                });
              } else {
                let spanTextStartIndex = completeSpanString.search(
                  getRegexWithStopWords(phrase)
                );
                if (spanTextStartIndex === -1) {
                  spanTextStartIndex = completeSpanStringWithSpace.search(
                    getRegexWithStopWords(phrase)
                  );
                }

                if (spanTextStartIndex === -1) {
                  console.warn('A weird scenario encountered:', {
                    textToHilite: phrase,
                    spanStartTextContent: spanStartTextContent,
                    spanEndTextContent: spanEndTextContent,
                  });
                  return;
                }
                console.debug('hilighting in the else part');

                let spanTextEndIndex =
                  phrase.length -
                  (spanStartTextContent.length - spanTextStartIndex);
                if (
                  completeSpanString.search(getRegexWithStopWords(phrase)) ===
                  -1
                ) {
                  spanTextEndIndex = spanTextEndIndex - 1;
                }
                if (
                  spanStart.innerHTML.search(
                    getRegexWithStopWords(
                      spanStartTextContent.substring(spanTextStartIndex)
                    )
                  ) > -1
                ) {
                  smartlySetInnerHTML(
                    spanStart,
                    spanStartTextContent.substring(spanTextStartIndex),
                    `<span class="${hilightClasses.join(
                      ' '
                    )}">${spanStartTextContent.substring(
                      spanTextStartIndex
                    )}</span>`
                  );
                } else {
                  const spanStartInnerHTML = [
                    spanStartTextContent.substring(0, spanTextStartIndex),
                    `<span class="${hilightClasses.join(
                      ' '
                    )}">${spanStartTextContent.substring(
                      spanTextStartIndex
                    )}</span>`,
                  ].join('');
                  smartlySetInnerHTMLWithInnerSpans(
                    spanStart,
                    spanStartInnerHTML
                  );
                }

                let index = spanStartIndex + 1;
                while (index < spanEndIndex) {
                  textLayer.textDivs[index].classList.add(...hilightClasses);
                  index++;
                }
                if (
                  spanEnd.innerHTML.search(
                    getRegexWithStopWords(
                      spanEndTextContent.substring(0, spanTextEndIndex)
                    )
                  ) > -1
                ) {
                  smartlySetInnerHTML(
                    spanEnd,
                    spanEndTextContent.substring(0, spanTextEndIndex),
                    `<span class="${hilightClasses.join(
                      ' '
                    )}">${spanEndTextContent.substring(
                      0,
                      spanTextEndIndex
                    )}</span>`
                  );
                } else {
                  const spanEndInnerHTML = [
                    `<span class="${hilightClasses.join(
                      ' '
                    )}">${spanEndTextContent.substring(
                      0,
                      spanTextEndIndex
                    )}</span>`,
                    spanEndTextContent.substring(spanTextEndIndex),
                  ].join('');
                  smartlySetInnerHTMLWithInnerSpans(spanEnd, spanEndInnerHTML);
                }
                addPhraseToCache({
                  phrase,
                  pageNumber,
                  spanStartIndex,
                  spanEndIndex,
                });
              }
            } catch (error) {
              console.error(error);
            }
          } else {
            console.error('Could not find a matching span for phrase:', phrase);
          }
        }
      );
    }

    _nlmObject.drawBox = function (
      selectedBlock,
      pageView,
      editable,
      onBoxChange
    ) {
      // first we need to create a stage
      let pageNumber = selectedBlock.page_idx + 1;
      if (selectedBlock.table_bbox && selectedBlock.table_page_idx) {
        pageNumber = selectedBlock.table_page_idx + 1;
      }

      let drawLayerId = 'drawLayer-' + pageNumber;
      let drawLayer = document.getElementById(drawLayerId);
      let div = pageView.div;
      if (!drawLayer) {
        drawLayer = document.createElement('div');
        drawLayer.style.width = div.style.width;
        drawLayer.style.height = div.style.height;
        drawLayer.style.position = 'absolute';

        drawLayer.id = 'drawLayer-' + div.getAttribute('data-page-number');
        drawLayer.classList.add('drawLayer');
        div.insertBefore(drawLayer, div.children[0]);
      }
      drawLayer.style.zIndex = editable ? 3 : 0;

      function drawInner() {
        let currentDrawLayer = document.getElementById(drawLayerId);
        let scaleX = pageView.viewport.scale;
        let scaleY = pageView.viewport.scale;

        var bbox = undefined;
        var x = 0;
        var y = 0;
        var width = 0;
        var height = 0;
        var fillColor = '#03989e';
        var strokeColor = '#03989e';
        if (selectedBlock.table_bbox && selectedBlock.table_bbox.length > 0) {
          bbox = selectedBlock.table_bbox;
          x = bbox[0] * scaleX;
          y = bbox[1] * scaleY;
          width = (bbox[2] - bbox[0]) * scaleX;
          height = (bbox[3] - bbox[1]) * scaleY;
        } else if (
          selectedBlock.header_bbox &&
          selectedBlock.header_bbox.length > 0
        ) {
          bbox = selectedBlock.header_bbox;
          x = bbox[0] * scaleX;
          y = bbox[1] * scaleY;
          width = (bbox[2] - bbox[0]) * scaleX;
          height = (bbox[3] - bbox[1]) * scaleY;
        } else if (selectedBlock.bbox && selectedBlock.bbox.length > 0) {
          bbox = selectedBlock.bbox;
          x = bbox[0] * scaleX;
          y = bbox[1] * scaleY;
          width = (bbox[2] - bbox[0]) * scaleX;
          height = (bbox[3] - bbox[1]) * scaleY;
        }

        var stage = new Konva.Stage({
          container: currentDrawLayer, // id of container <div>
          width: currentDrawLayer.offsetWidth,
          height: currentDrawLayer.offsetHeight,
          opacity: 1.0,
        });
        // then create layer
        var layer = new Konva.Layer();

        // create our shape
        var box = null;
        box = new Konva.Rect({
          x: x - 2,
          y: y - 2,
          width: width + 4,
          height: height + 8,
          fill: 'transparent',
          stroke: strokeColor,
          strokeWidth: 2,
          draggable: editable,
          name: 'nlm-hilight',
        });
        if (!editable) {
          var thickLine = null;
          thickLine = new Konva.Rect({
            x: x - 7,
            y: y - 2,
            width: 5,
            height: height + 8,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: 2,
            draggable: editable,
            name: 'nlm-hilight',
          });
          layer.add(thickLine);
        }

        if (editable) {
          var tr1 = new Konva.Transformer({
            nodes: [box],
            // ignore stroke in size calculations
            ignoreStroke: true,
            rotateEnabled: false,
            anchorStroke: 'dodgerblue',
            anchorFill: 'darkslateblue',
            anchorSize: 12,
            borderStrokeWidth: 0,
            // manually adjust size of transformer
            padding: 2,
          });
          layer.add(tr1);

          // first way to skip stroke resize, is just by resetting scale
          // and setting width/height instead
          box.on('transform', () => {
            box.setAttrs({
              width: Math.max(box.width() * box.scaleX(), 5),
              height: Math.max(box.height() * box.scaleY(), 5),
              scaleX: 1,
              scaleY: 1,
            });
          });

          box.on('transformend', function () {
            onBoxChange([
              box.x() / scaleX,
              box.y() / scaleY,
              (box.x() + box.width()) / scaleX,
              (box.y() + box.height()) / scaleY,
            ]);
          });

          box.on('dragmove', function () {
            onBoxChange([
              box.x() / scaleX,
              box.y() / scaleY,
              (box.x() + box.width()) / scaleX,
              (box.y() + box.height()) / scaleY,
            ]);
          });
        }
        // add the shape to the layer
        layer.add(box);

        // add the layer to the stage
        stage.add(layer);

        // draw the image
        layer.draw();
        pageView.annotationLayerFactory.container.scrollTop =
          pageView.div.offsetTop + y - 100;
      }
      onElementReady(drawLayerId).then(() => {
        drawInner();
      });
    };
    return _nlmObject;
  }
  if (typeof window.nlmExtensions === 'undefined') {
    window.nlmExtensions = nlmExtensions();
  }
})(window);
