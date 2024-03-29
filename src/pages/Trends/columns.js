import moment from 'moment';
import { dateDisplayFormat } from '../../utils/dateUtils';
import { Typography } from 'antd';
import numeral from 'numeral';

const amountRenderer = amount =>
  amount ? numeral(amount).format('($ 0.00 a)') : '-';
export default {
  recentDeals: [
    {
      title: 'Date',
      dataIndex: 'pubDate',
      key: 'pubDate',
      render: text => moment(text).format(dateDisplayFormat),
      width: 150,
    },
    {
      title: 'Borrower',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Administrative Agent',
      dataIndex: 'administrativeAgent',
      key: 'administrativeAgent',
    },
    {
      title: 'Agreement Type',
      dataIndex: 'agreementType',
      key: 'agreementType',
    },
    {
      title: 'Amendment No.',
      dataIndex: 'amendmentNumber',
      key: 'amendmentNumber',
    },
    {
      title: 'Cover Amount',
      dataIndex: 'coverAmount',
      key: 'coverAmount',
      render: amountRenderer,
    },
    {
      title: '100+  Data Points',
      dataIndex: 'more',
      key: 'more',
      width: 125,
      render: () => (
        <Typography.Link href="https://sec.nlmatics.com/" target="_blank">
          View Data Points
        </Typography.Link>
      ),
    },
  ],
  dealsByIndustry: [
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: '# Deals',
      dataIndex: 'deals',
      key: 'deals',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amountRenderer,
    },
  ],
  dealsBySector: [
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
    },
    {
      title: '# Deals',
      dataIndex: 'deals',
      key: 'deals',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amountRenderer,
    },
  ],
  dealsByBorrowerCounsel: [
    {
      title: 'Borrower Counsel',
      dataIndex: 'borrowerCounsel',
      key: 'borrowerCounsel',
    },
    {
      title: '# Deals',
      dataIndex: 'deals',
      key: 'deals',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amountRenderer,
    },
  ],
  dealsByAgentCounsel: [
    {
      title: 'Agent Counsel',
      dataIndex: 'agentCounsel',
      key: 'agentCounsel',
    },
    {
      title: '# Deals',
      dataIndex: 'deals',
      key: 'deals',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amountRenderer,
    },
  ],
  dealsByAdministrativeAgent: [
    {
      title: 'Administrative Agent',
      dataIndex: 'administrativeAgent',
      key: 'administrativeAgent',
    },
    {
      title: '# Deals',
      dataIndex: 'deals',
      key: 'deals',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amountRenderer,
    },
  ],
};
