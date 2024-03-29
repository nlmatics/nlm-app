import ChattyPdfApp from '../../ChattyPdfApp';
import EdgarApp from '../../EdgarApp';
import Nlmatics from '../../nlmatics';
import App from './AppContext';

const APP_NAMES = {
  NLMATICS: 'NLMATICS',
  CHATTY_PDF: 'CHATTY_PDF',
  EDGAR: 'EDGAR',
};

const name = localStorage.getItem('APP_NAME') || process.env.REACT_APP_APP_NAME;

const getApp = name => {
  let app;
  switch (name) {
    case APP_NAMES.CHATTY_PDF:
      app = <ChattyPdfApp />;
      break;
    case APP_NAMES.EDGAR:
      app = <EdgarApp />;
      break;
    default:
      app = <Nlmatics />;
  }
  return app;
};
export default function AppProvider() {
  return (
    <App.Provider
      value={{
        name,
        APP_NAMES,
        isChattyPdf: () => name === APP_NAMES.CHATTY_PDF,
        isEDGAR: () => name === APP_NAMES.EDGAR,
      }}
    >
      {getApp(name)}
    </App.Provider>
  );
}
