import loadable from '@loadable/component';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { useState } from 'react';
import { useContext } from 'react';
import ThemeContext from '../../contexts/theme/ThemContext';
const LM = loadable.lib(() => import('ag-grid-enterprise'));
export default function AgGridWrapper({ children, height }) {
  const { theme, THEMES } = useContext(ThemeContext);
  const [isAgGridEnterpriseLibLoaded, setIsAgGridEnterpriseLibLoaded] =
    useState(false);

  LM.load().then(module => {
    // module?.LicenseManager?.setLicenseKey(
    //   //set license key here
    // );
    setIsAgGridEnterpriseLibLoaded(false);//uncomment above code and set this to true if using enterprise license
  });

  const className =
    theme === THEMES.DARK ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  if (!isAgGridEnterpriseLibLoaded) {
    return null;
  }
  return (
    <div className={`nlm-ag-grid ${className}`} style={{ height }}>
      {children}
    </div>
  );
}
