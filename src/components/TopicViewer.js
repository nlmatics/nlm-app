import { useContext, Fragment } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Typography, List } from 'antd';
import Highlighter from 'react-highlight-words';
import { goToFileSearch, getFileIdFromName } from '../utils/helpers.js';
import { WorkspaceContext } from './Workspace.js';
import { useAuth } from '../utils/use-auth.js';
import { Button, Tag } from 'antd';
import '../index.css';

const { Title, Paragraph, Text } = Typography;

const useStyles = makeStyles({
  topPhraseSider: {
    height: '94%',
    overflowY: 'hidden',
    paddingRight: '15px',
    '&:hover': {
      overflowY: 'overlay',
    },
  },
  topicViewer: {
    height: '100vh',
    width: '95%',
    boxShadow: '0px 0px 1px #00000070',
    paddingLeft: '15px',
    overflowY: 'hidden',
    paddingRight: '15px',
    '&:hover': {
      overflowY: 'overlay',
    },
  },
  topPhraseTitle: {
    marginTop: '2px',
    fontSize: '26px',
    paddingLeft: '10px',
    borderBottom: '1px solid #D3D3D3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

function DetailSection({ item, user, workspaceContext }) {
  return Object.entries(item.details ? item.details : []).map(
    (detail, index) => (
      <Fragment key={index}>
        <Button
          type="link"
          style={{
            paddingLeft: '0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'left',
          }}
          onClick={() =>
            goToFileSearch(
              user,
              workspaceContext,
              getFileIdFromName(workspaceContext, detail[0])
            )
          }
        >
          {detail[0]}
        </Button>
        <List>
          {detail[1].map((match, index) => (
            <List.Item
              key={index}
              style={{
                paddingTop: '0px',
                paddingBottom: '10px',
                borderBottom: '1px solid #D3D3D3',
              }}
            >
              <Highlighter
                unhighlightClassName="phrase-mark"
                highlightClassName="global-answer-in-phrase-mark"
                searchWords={[match.answer]}
                autoEscape={true}
                textToHighlight={match.text}
              />
            </List.Item>
          ))}
        </List>
      </Fragment>
    )
  );
}

export default function TopicViewer({ topicData }) {
  const workspaceContext = useContext(WorkspaceContext);
  const auth = useAuth();
  const { user } = auth;
  const classes = useStyles();

  return (
    <div className={classes.topicViewer}>
      <h4 className={classes.topPhraseTitle}>Top Phrases:</h4>
      {topicData.map((item, index) => (
        <div className={classes.topPhraseSider} key={index}>
          <Title
            level={3}
            orientation="left"
            style={{ textTransform: 'capitalize' }}
          >
            {item.cluster_label}
          </Title>
          <Text strong>Phrases:</Text>
          <Paragraph>
            {item.cluster_phrases.split(',').map(x => (
              <Tag key={x} color="magenta">
                {x}
              </Tag>
            ))}
          </Paragraph>
          {(item.children ? item.children : []).map((childItem, index) => (
            <div
              style={{ marginLeft: '10px', paddingLeft: '15px' }}
              key={index}
            >
              <Title level={4} orientation="left">
                Subgroup:
              </Title>
              <Text strong>Phrases:</Text>
              <Paragraph>{childItem.cluster_phrases}</Paragraph>
              <Text strong>Words:</Text>
              <Paragraph>{childItem.cluster_top_words}</Paragraph>
              <DetailSection item={childItem} />
            </div>
          ))}
          <DetailSection
            user={user}
            workspaceContext={workspaceContext}
            item={item}
          />
        </div>
      ))}
    </div>
  );
}
