import { useLocation, useParams } from 'react-router-dom';

export default function usePageHelper() {
  const { pathname } = useLocation();
  const { documentId } = useParams();
  const isSearchPage = pathname?.startsWith('/search');
  const isSearchResultsPage = pathname?.endsWith('/results');
  const isSearchHomePage = isSearchPage && !isSearchResultsPage;
  const isWorkspaceSearchPage = pathname.endsWith('/search');
  const isDocumentPage = !!documentId;

  return {
    isSearchPage,
    isDocumentPage,
    isWorkspaceSearchPage,
    isSearchHomePage,
  };
}
