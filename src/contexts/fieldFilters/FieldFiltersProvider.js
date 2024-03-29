import { useState } from 'react';
import FieldFiltersContext from './FieldFiltersContext';

export default function FieldFiltersProvider({ children }) {
  const [fieldFilters, setFieldFilters] = useState(null);
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [openFieldFilters, setOpenFieldFilters] = useState([]);
  return (
    <FieldFiltersContext.Provider
      value={{
        fieldFilters,
        setFieldFilters,
        openFieldFilters,
        setOpenFieldFilters,
        showAppliedFilters,
        setShowAppliedFilters,
      }}
    >
      {children}
    </FieldFiltersContext.Provider>
  );
}
