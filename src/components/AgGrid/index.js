import loadable from '@loadable/component';
const AG = loadable.lib(() => import('ag-grid-react'));

export default function AgGrid(props) {
  return (
    <AG fallback={() => {}}>
      {({ default: { AgGridReact } }) => <AgGridReact {...props}></AgGridReact>}
    </AG>
  );
}
