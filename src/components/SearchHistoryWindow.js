import { useState, useEffect, useContext } from 'react';
import { Modal, Button } from 'antd';
import { Card } from 'antd';
import { getSearchHistoryFull } from '../utils/apiCalls';
import { WorkspaceContext } from './Workspace';

export default function SearchHistoryWindow(props) {
  const [searchWindowVisible, setSearchWindowVisible] = useState(false);
  const [historyOptions, setHistoryOptions] = useState([]);
  const workspaceContext = useContext(WorkspaceContext);

  function handleChange() {
    // Here, we invoke the callback with the new value
    props.onClose();
  }

  useEffect(() => {
    setSearchWindowVisible(props.visible);
    getSearchHistoryFull(props.user).then(result => {
      setHistoryOptions({ result });
    });
  }, [props.visible]);

  useState(() => {}, []);

  // const renderHistoryOptions = (
  //   <>
  //   {searchWindowVisible ? getSearchHistory(props.user).then(result => setHistoryOptions({result})) : null}
  //   {historyOptions ? historyOptions.result.map(option => <p>{option.value}</p>) : null}
  //   </>
  // );

  const handleFormatSelect = format => {
    if (Array.isArray(format)) {
      format = format.join('');
    }

    // eslint-disable-next-line
    const numberFormMoney = /NumberFormatterProcessor\(\"MONEY\"\)/;
    // eslint-disable-next-line
    const numberFormUnit = /NumberFormatterProcessor\(\"UNITS\"\)/;
    let moneyFormat = format.match(numberFormMoney);
    let unitFormat = format.match(numberFormUnit);
    let renderFormat = '';

    if (unitFormat) {
      renderFormat = renderFormat + 'Unit (%, ft) ';
    }

    if (moneyFormat) {
      renderFormat = renderFormat + 'Currency ($) ';
    }
    return renderFormat;
  };

  const handleCustomFormat = format => {
    if (Array.isArray(format)) {
      format = format.join('');
    }

    // eslint-disable-next-line
    const answerPicker = /AnswerPicker\(\[\"(.*)\"\,\]/;
    let answerFormat = format.match(answerPicker);
    let renderAnsFormat = '';

    if (answerFormat) {
      renderAnsFormat =
        renderAnsFormat +
        answerFormat[1].replace(/["']/g, '').replace(',', ', ');
    }

    return renderAnsFormat;
  };

  const searchPastQuery = option => {
    // execute query
    // close modal
    // pass callback to header bar searchCriteria
    workspaceContext.setWorkspaceSearchHistoryTriggered(true);
    workspaceContext.setWorkspaceSearchHistoryParams(option);
    if (option.header === null || option.header === undefined) {
      option.header = '';
    }
    option.format = option.format.join('');
    // console.log("Searching", option);
    props.onChange(option);
    props.onClose();
  };

  const renderHistoryOptions = () => {
    if (searchWindowVisible) {
      if (historyOptions.length === 0) {
        getSearchHistoryFull(props.user).then(result => {
          setHistoryOptions({ result });
        });
      }
      if (historyOptions.result) {
        return historyOptions.result.map((option, index) => (
          <Card key={index} style={{ marginBottom: '1%' }}>
            <p>
              <b>Question:</b> {option.question}
            </p>
            <p>
              <b>Format:</b> {handleFormatSelect(option.format)}
            </p>
            <p>
              <b>Custom Format:</b> {handleCustomFormat(option.format)}
            </p>
            <p>
              <b>Patterns:</b> {option.pattern.map(pattern => pattern + ' ')}
            </p>
            <p>
              <b>Header:</b> {option.header}
            </p>
            <Button
              name={option}
              key={option}
              style={{ left: '75%', marginBottom: '4%' }}
              onClick={() => searchPastQuery(option)}
            >
              Run Search
            </Button>
            {/* <hr style={{borderTop:"3px solid #bbb"}}/> */}
          </Card>
        ));
      }
    }
  };

  return (
    <Modal
      open={searchWindowVisible}
      zIndex={9999}
      title="Search History"
      onCancel={handleChange}
      width={500}
      footer={[
        <Button key="Cancel" onClick={handleChange}>
          Cancel
        </Button>,
      ]}
    >
      {/* <hr style={{borderTop:"3px solid #bbb"}}/> */}
      <div style={{ overflowY: 'scroll', width: '100%', height: '50vh' }}>
        {renderHistoryOptions()}
      </div>
    </Modal>
  );
}
