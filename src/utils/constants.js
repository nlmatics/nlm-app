import {
  defaultFormatter,
  formatDate,
  formatMoney,
  formatNumber,
  formatPeriod,
} from './valueFormatters';

export const viewTypes = {
  TEXT: 'None',
  GRAPH: 'Chart',
  GRID: 'Data View Field',
};

export const workspaceGrids = {
  EXTRACT: 'extract-grid',
  SEARCH: 'search-grid',
};

export const displayDateFormat = 'M/DD/YYYY';

export const dataTypes = {
  LIST: 'list',
  DATE: 'date',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  PERIOD: 'period',
  TEXT: 'text',
  MONEY: 'money',
};

export const dataTypesFormatters = {
  list: defaultFormatter,
  date: formatDate,
  money: formatMoney,
  number: formatNumber,
  boolean: defaultFormatter,
  period: formatPeriod,
  text: defaultFormatter,
};

export const statusTypes = {
  CONFIDENCE_LEVEL: 0.8,
  OVERRIDEN: 'Overriden',
  LOW_CONFIDENCE: 'Low Confidence',
  NORMAL: 'Normal',
};

export const groupTypes = {
  SINGLE: 'single',
  SAME_ANSWER: 'same_answer',
  SIMILAR_ANSWER: 'similar_answer',
  SAME_LOCATION: 'same_location',
  LIST_ITEM: 'list_item',
  TABLE: 'table',
  HEADER_SUMMARY: 'header_summary',
};

export const groupDescriptions = {
  single: 'Potential answer',
  same_answer: 'Multiple sections have this answer',
  similar_answer: 'Similar answers found in multiple sections',
  same_location: 'Multiple answers found in same location',
  list_item: 'Showing answers from a list',
  table: 'Answer found in table',
  header_summary: 'Section summary',
};

export const viewFields = {
  ANSWER: 'answer',
  MATCH: 'match',
  FORMATTED_ANSWER: 'formatted_answer',
  ANSWER_DETAILS: 'answer_details',
  SCALED_SCORE: 'scaled_score',
  HEADER_TEXT: 'header_text',
};

export const fieldEditSources = {
  DETAIL_SIDER: 'DetailSider',
  WORKSPACE_GRID: 'WorkspaceGrid',
  DOC_DATA_VIEW: 'DocDataView',
};

export const leftBarWidth = 10;
export const searchCriteriaDefaults = {
  DOC_PER_PAGE: 25,
  RELATIONS_PER_PAGE: 25,
};

export const questionTipsDataSource = [
  {
    expected: 'individual',
    questionStart: 'who is',
    question: 'the chairman',
  },
  {
    expected: 'organization',
    questionStart: 'which firm is, which entity is, who is',
    question: 'the parent company',
  },
  {
    expected: 'money',
    questionStart: 'how much are the',
    question: 'operating costs',
  },
  {
    expected: 'equivalent term/definition',
    questionStart: 'what is',
    question: 'the interest rate',
  },
  {
    expected: 'address',
    questionStart: 'where is',
    question: 'the head office of the company',
  },
  {
    expected: 'city, country',
    questionStart: 'what is the city/country',
    question: 'of the head office of the company',
  },
  {
    expected: 'distance',
    questionStart: 'how far',
    question: 'is the bus stop from here',
  },
  {
    expected: 'description',
    questionStart: 'what is the',
    question: 'cause of failure',
  },

  {
    expected: 'date',
    questionStart: 'when is',
    question: 'it due',
  },
  {
    expected: 'period',
    questionStart: 'how long',
    question: 'is the observation period',
  },
  {
    expected: 'technique or method',
    questionStart: 'what is the technique',
    question: 'used for distilling water',
  },
  {
    expected: 'yes/no',
    questionStart: 'is, will, should, can, should, have, need, must, does',
    question: 'questions',
  },
];

export const answerTypeKey = {
  YES_NO: 'yes/no',
};

export const safeHTML = {
  allowedTags: [
    'a',
    'abbr',
    'address',
    'article',
    'aside',
    'b',
    'bdi',
    'bdo',
    'blockquote',
    'br',
    'button',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'dd',
    'dfn',
    'div',
    'dl',
    'dt',
    'em',
    'figcaption',
    'figure',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'i',
    'kbd',
    'li',
    'main',
    'mark',
    'nav',
    'ol',
    'p',
    'pre',
    'q',
    'rb',
    'rp',
    'rt',
    'rtc',
    'ruby',
    's',
    'samp',
    'section',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'time',
    'tr',
    'u',
    'ul',
    'var',
    'wbr',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    button: ['button_type'],
    '*': ['class', 'style', 'page_idx'],
  },
};

export const categoricalAnswerTypes = ['LOC', 'HUM', 'ENTY'];

export const answerTypeOptions = {
  auto: 'auto',
  disable: 'disable',
  'LOC:state': 'state',
  'LOC:city': 'city',
  'LOC:country': 'country',
  'NUM:money': 'money',
  'NUM:date': 'date',
  'NUM:period': 'period',
  'NUM:count': 'count',
  'NUM:code': 'code',
  'HUM:ind': 'person',
  'HUM:gr': 'organization',
  'NUM:volsize': 'volume or Size',
  'NUM:dist': 'distance',
  'NUM:temp': 'temperature',
  'NUM:weight': 'weight',
};
export const answerTypeDescriptions = {
  'LOC:state': 'state',
  'LOC:city': 'city',
  'LOC:country': 'country',
  'LOC:other': 'other Location',
  'LOC:mount': 'other Location',
  'ENTY:cremat': 'work of art',
  'ENTY:currency': 'currency',
  'NUM:money': 'money',
  'NUM:date': 'date',
  'NUM:period': 'period',
  'ENTY:event': 'event',
  'ENTY:product': 'product',
  'ENTY:food': 'food',
  'ENTY:disease': 'disease',
  'ENTY:body': 'body',
  'ENTY:substance': 'substance',
  'ENTY:sport': 'sport',
  'ENTY:termeq': 'equivalent term',
  'ENTY:veh': 'vehicle',
  'ENTY:techmeth': 'technology or method',
  'ENTY:color': 'technology or method',
  'NUM:count': 'count',
  'NUM:code': 'code',
  'HUM:ind': 'person',
  'HUM:gr': 'organization',
  'ENTY:religion': 'religion',
  'NUM:volsize': 'volume or Size',
  'NUM:dist': 'distance',
  'NUM:temp': 'temperature',
  'NUM:weight': 'weight',
  'ENTY:lang': 'language',
  'NUM:perc': 'percent',
  'NUM:speed': 'measurement',
  'DESC:desc': 'description',
  'DESC:manner': 'manner',
  'DESC:def': 'definition',
  'DESC:reason': 'reason',
  bool: 'yes/no',
  '': 'n/a',
  disable: 'n/a',
};

// role constants
export const roles = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  OWNER: 'owner',
  UNAUTHORIZED: '',
};

export const displayFormats = {
  PDF: 'PDF',
  HTML: 'HTML',
  XML: 'XML',
  JSON: 'JSON',
};

export const relationtypes = {
  TRIPLE: 'triple',
  NODE: 'node',
  MULTI: 'multi',
};

export const PERIOD_MULTIPLIERS = {
  millisecond: 1,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export const BIO_ENTITY_LABEL_CONFIG = {
  disease: { label: 'Disease', color: '#e6194B', defaultHilight: true },
  onco_disease: {
    label: 'Onco Disease',
    color: '#820825',
    defaultHilight: true,
  },
  drug: { label: 'Drug / Chemical', color: '#3cb44b', defaultHilight: true },
  chemical: {
    label: 'Drug / Chemical',
    color: '#3cb44b',
    defaultHilight: true,
  },
  mutation: { label: 'Mutation', color: '#dd9e22', defaultHilight: true },
  gene: { label: 'Gene', color: '#4363d8', defaultHilight: true },
  onco_gene: { label: 'Onco Gene', color: '#05185c', defaultHilight: true },
  species: { label: 'Species', color: '#f58231', defaultHilight: false },
  cell_line: { label: 'Cell Line', color: '#9A6324', defaultHilight: true },
  DNA: { label: 'DNA', color: '#808000', defaultHilight: false },
  RNA: { label: 'RNA', color: '#469990', defaultHilight: false },
  cell_type: { label: 'Cell Type', color: '#f032e6', defaultHilight: true },
};

export const GENERAL_ENTITY_LABEL_CONFIG = {
  'NUM:date': {
    label: 'Date or Period',
    color: '#e6194B',
    defaultHilight: true,
  },
  'NUM:period': {
    label: 'Date or Period',
    color: '#e6194B',
    defaultHilight: true,
  },
  'HUM:gr': { label: 'Organization', color: '#3cb44b', defaultHilight: false },
  'HUM:ind': { label: 'Person', color: '#4363d8', defaultHilight: false },
  'NUM:count': {
    label: 'Count or Code',
    color: '#f58231',
    defaultHilight: false,
  },
  'NUM:code': {
    label: 'Count or Code',
    color: '#f58231',
    defaultHilight: false,
  },
  'ENTY:currency': { label: 'Money', color: '#9A6324', defaultHilight: true },
  'NUM:money': { label: 'Money', color: '#9A6324', defaultHilight: true },
  'LOC:city': { label: 'Location', color: '#808000', defaultHilight: false },
  'LOC:state': { label: 'Location', color: '#808000', defaultHilight: false },
  'LOC:country': { label: 'Location', color: '#808000', defaultHilight: false },
  'NUM:volsize': {
    label: 'Measurement',
    color: '#469990',
    defaultHilight: false,
  },
  'NUM:dist': { label: 'Measurement', color: '#469990', defaultHilight: false },
  'NUM:temp': { label: 'Measurement', color: '#469990', defaultHilight: false },
  'NUM:weight': {
    label: 'Measurement',
    color: '#469990',
    defaultHilight: false,
  },
  'NUM:speed': {
    label: 'Measurement',
    color: '#469990',
    defaultHilight: false,
  },
};
