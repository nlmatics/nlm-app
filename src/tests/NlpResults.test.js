import { shallow } from 'enzyme';
import '@material-ui/styles';

import NlpResults from '../components/NlpResults';
import * as AuthUtils from '../utils/use-auth.js';
import { WorkspaceContext } from '../components/Workspace';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

//mock Materials makeStyles
jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: jest.fn().mockReturnValue(jest.fn()),
}));

describe('NlpResults', () => {
  it('renders', () => {
    const wrapper = shallow(
      <WorkspaceContext.Provider value={{ fieldSet: [] }}>
        <NlpResults
          setDetailVisible={false}
          editedField={[]}
          setEditedField={() => {
            return;
          }}
          record={null}
          rowData={[]}
          renderRowData={() => {
            return;
          }}
        />
      </WorkspaceContext.Provider>
    );
    expect(wrapper).toBeTruthy();
  });
});
