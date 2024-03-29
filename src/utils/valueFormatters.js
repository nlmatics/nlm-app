// import { displayDateFormat } from '../utils/constants';
import moment from 'moment';
import { dateDisplayFormat } from './dateUtils';

export const formatPeriod = searchResult => {
  let formattedValue = '';
  if (searchResult) {
    if (searchResult.answer_details) {
      formattedValue = searchResult.answer_details.formatted_value;
    }
  }
  return formattedValue;
};
export const formatNumericText = (text, replaceNaNWithBlank = false) => {
  // Avoid emtpy strings getting converted to 0
  if (typeof text === 'string' && text?.trim() === '') {
    return '';
  }
  let formattedValue = text;
  if (!isNaN(text)) {
    formattedValue = new Intl.NumberFormat('en-US', {
      maximumSignificantDigits: 10,
    }).format(text);
  } else if (replaceNaNWithBlank) {
    formattedValue = '';
  }
  return formattedValue;
};

export const formatNumber = searchResult => {
  let formattedValue = '';
  if (searchResult) {
    if (searchResult.answer_details) {
      formattedValue = formatNumericText(searchResult.answer_details.raw_value);
    } else {
      formattedValue = formatNumericText(searchResult.answer);
    }
  }
  return formattedValue;
};

export const defaultFormatter = searchResult => {
  return searchResult.formatted_answer;
};

export const formatDate = searchResult => {
  let formattedValue = '';
  let rawValue = searchResult.answer;
  if (searchResult.answer_details) {
    rawValue = searchResult.answer_details.raw_value;
  }
  if (rawValue) {
    const d = moment.utc(rawValue * 1000);
    if (d.isValid()) {
      formattedValue = d.format(dateDisplayFormat);
    }
  }
  return formattedValue;
};
export const formatMoney = searchResult => {
  let formattedValue = '';
  if (searchResult) {
    let moneyDetails = searchResult.answer_details;
    if (
      moneyDetails &&
      moneyDetails.raw_value &&
      !isNaN(moneyDetails.raw_value)
    ) {
      if (moneyDetails['unit']) {
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: moneyDetails.unit,
          maximumSignificantDigits: 10,
        }).format(moneyDetails.raw_value);
      } else {
        formattedValue = formatNumericText(moneyDetails.raw_value);
      }
    }
    if (formattedValue === '' && searchResult.answer) {
      formattedValue = ''; //searchResult.answer;
    }
  }
  return formattedValue;
};

export const formatAnswer = (answerDetails, options) => {
  if (options && options.answer_type && options.answer_type === 'NUM:money') {
    return formatMoney(answerDetails);
  } else {
    return answerDetails.raw_value;
  }
};
