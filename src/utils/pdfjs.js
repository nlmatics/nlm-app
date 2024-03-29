export default class PDFJSBackend {
  static init({ source, element, pagemode, onload }) {
    if (document.getElementById('pdfIframe'))
      element?.removeChild(document.getElementById('pdfIframe'));

    const iframe = document.createElement('iframe');

    iframe.src = `/pdfjs/web/viewer.html?file=${source}#zoom=page-width&pagemode=${pagemode}`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.id = 'pdfIframe';
    iframe.onload = function (e) {
      onload(e);
    };
    element?.appendChild(iframe);
    return iframe;
  }
}
