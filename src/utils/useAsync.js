import { useState, useEffect, useCallback } from 'react';

export const useAsync = (asyncFunction, immediate = true, name) => {
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(
    (...args) => {
      setPending(true);
      setValue(null);
      setError(null);
      return asyncFunction(...args)
        .then(response => setValue(response))
        .catch(error => setError(error))
        .finally(() => setPending(false));
    },
    [asyncFunction]
  );

  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  let executeKey = name + 'Execute';
  let pendingKey = name + 'Pending';
  let valueKey = name + 'Value';
  let errorKey = name + 'Error';

  return {
    [executeKey]: execute,
    [pendingKey]: pending,
    [valueKey]: value,
    [errorKey]: error,
  };
};
