import { useState } from 'react';
import DocumentConfigContext from './DocumentConfigContext';

export default function DocumentConfigProvider({ children }) {
  const [showTablesOnly, setShowTablesOnly] = useState(false);
  return (
    <DocumentConfigContext.Provider
      value={{
        showTablesOnly,
        setShowTablesOnly,
      }}
    >
      {children}
    </DocumentConfigContext.Provider>
  );
}
