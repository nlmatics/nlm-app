import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import PeriodFilter from '../components/filters/PeriodFilter';
import { PERIOD_MULTIPLIERS } from '../utils/constants';

export default forwardRef(function AgPeriodFilter(
  { filterChangedCallback },
  ref
) {
  const [periodInMilliSeconds, setPeriodInMilliSeconds] = useState();
  const [endPeriodInMilliSeconds, setEndPeriodInMilliSeconds] = useState();
  const [filterActive, setFilterActive] = useState(false);
  const [operator, setOperator] = useState();
  const [periodUnit, setPeriodUnit] = useState();
  const [floatingFilterString, setFloatingFilterString] = useState();
  let closeFilterPopup;

  const onFilterChangedCallback = useCallback(filterChangedCallback, [
    filterChangedCallback,
  ]);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      isFilterActive() {
        return filterActive;
      },

      getModel() {
        return filterActive
          ? {
              filterType: 'number',
              type: operator,
              filter: periodInMilliSeconds,
              ...(operator === 'inRange' && {
                filterTo: endPeriodInMilliSeconds,
              }),
              floatingFilterString,
              periodUnit,
            }
          : null;
      },

      setModel(model) {
        const { type, filter, filterTo, floatingFilterString, periodUnit } =
          model || {
            type: null,
            filter: null,
            filterTo: null,
            floatingFilterString: null,
            periodUnit: null,
          };
        setOperator(type);
        setPeriodInMilliSeconds(filter);
        setEndPeriodInMilliSeconds(filterTo);
        setPeriodUnit(periodUnit);
        setFloatingFilterString(floatingFilterString);
        setFilterActive(!!type);
      },

      afterGuiAttached({ hidePopup }) {
        closeFilterPopup = hidePopup;
      },
    };
  });

  const onFilterChange = ({
    operator,
    periodInMilliSeconds,
    endPeriodInMilliSeconds,
    periodUnit,
    floatingFilterString,
  }) => {
    setOperator(operator);
    setPeriodInMilliSeconds(periodInMilliSeconds);
    setEndPeriodInMilliSeconds(endPeriodInMilliSeconds);
    setPeriodUnit(periodUnit);
    setFilterActive(operator && !isNaN(periodInMilliSeconds));
    setFloatingFilterString(floatingFilterString);
    closeFilterPopup();
  };

  useEffect(() => {
    if (operator !== undefined && onFilterChangedCallback) {
      onFilterChangedCallback();
    }
  }, [
    operator,
    periodInMilliSeconds,
    endPeriodInMilliSeconds,
    onFilterChangedCallback,
  ]);

  return (
    <div
      style={{ margin: '10px', width: 250 }}
      onClick={e => e.preventDefault()}
      className="ag-custom-component-popup"
    >
      <PeriodFilter
        onFilterChange={onFilterChange}
        filterFormData={{
          operator,
          period: periodInMilliSeconds / PERIOD_MULTIPLIERS[periodUnit],
          endPeriod: endPeriodInMilliSeconds / PERIOD_MULTIPLIERS[periodUnit],
          periodUnit,
          floatingFilterString,
        }}
      ></PeriodFilter>
    </div>
  );
});
