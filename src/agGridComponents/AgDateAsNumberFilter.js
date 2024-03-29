import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import moment from 'moment';
import DateAsNumberFilter from '../components/filters/DateAsNumberFilter';

export default forwardRef(function AgDateAsNumberFilter(
  { filterChangedCallback },
  ref
) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterActive, setFilterActive] = useState(false);
  const [operator, setOperator] = useState();
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
              filter: startDate,
              ...(operator === 'inRange' && {
                filterTo: endDate,
              }),
              floatingFilterString,
            }
          : null;
      },

      setModel(model) {
        const { type, filter, filterTo, floatingFilterString } = model || {
          type: null,
          filter: null,
          filterTo: null,
          floatingFilterString: null,
        };
        setOperator(type);
        setStartDate(filter);
        setEndDate(filterTo);
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
    startDateEpochInUTC,
    endDateEpochInUTC,
    floatingFilterString,
  }) => {
    setOperator(operator);
    setStartDate(startDateEpochInUTC);
    setEndDate(endDateEpochInUTC);
    setFilterActive(operator && !isNaN(startDateEpochInUTC));
    setFloatingFilterString(floatingFilterString);
    closeFilterPopup();
  };

  useEffect(() => {
    if (operator !== undefined && onFilterChangedCallback) {
      onFilterChangedCallback();
    }
  }, [operator, startDate, endDate, onFilterChangedCallback]);

  return (
    <div
      style={{ margin: '10px', width: 250 }}
      className="ag-custom-component-popup"
    >
      <DateAsNumberFilter
        onFilterChange={onFilterChange}
        filterFormData={{
          operator,
          startDate: startDate && moment(startDate * 1000),
          endDate: endDate && moment(endDate * 1000),
          floatingFilterString,
        }}
      ></DateAsNumberFilter>
    </div>
  );
});
