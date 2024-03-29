import moment from 'moment';

export const dateDisplayFormat = 'll';

export const getEpochInUTCFromMomentDate = momentDate => {
  momentDate.utc(true);
  momentDate.startOf('day');
  return momentDate.unix();
};

export const getMomentDateFromEpoch = epoch => {
  const momentDate = epoch ? moment.utc(epoch * 1000) : null;
  return momentDate?.isValid() ? momentDate : null;
};

export const getFormattedDateStringFromMomentDate = momentDate => {
  return momentDate && momentDate.format(dateDisplayFormat);
};

export const getFormattedDateStringFromEpoch = epoch => {
  return getMomentDateFromEpoch(epoch)?.format(dateDisplayFormat);
};

export const getPresetRanges = () => ({
  Today: [moment(), moment()],
  'Last Week': [moment().subtract(1, 'w'), moment()],
  'Last 2 Weeks': [moment().subtract(2, 'w'), moment()],
  'Last Month': [moment().subtract(1, 'M'), moment()],
  'Last 6 Months': [moment().subtract(6, 'M'), moment()],
  'Last Year': [moment().subtract(1, 'y'), moment()],
});
