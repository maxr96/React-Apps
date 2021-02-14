import './App.css';
import { useCallback, useEffect, useReducer, useRef, useState, useMemo} from 'react'
import axios from 'axios';
import SearchForm from './SearchForm';
import List from './List';

export type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

export type Stories = Array<Story>;

type StoriesState = {
  data: Stories;
  page: number;
  isLoading: boolean;
  isError: boolean;
}

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}
interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: any;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const useSemiPersistentState = (
    key: string, 
    initialState: string
  ): [string, (newValue: string) => void] => {
  const isMounted = useRef(false);
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    if(!isMounted.current){
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key])

  return [value, setValue];
};

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data:           
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),

        page: action.payload.page
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID)
        };
    default:
      throw new Error();
  }
}

const getSumComments = (stories: StoriesState) => {

  return stories.data.reduce(
    (result: any, value: any) => result + value.num_comments,
    0
  );
};

const extractSearchTerm = (url: string) => url.substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '');
const getLastSearches = (urls: string[]) => Array.from(new Set(urls)).slice(-6, -1).map(extractSearchTerm);
const getUrl = (searchTerm: string, page: number) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [urls, setUrls] = useState([getUrl(searchTerm, 0)]);
  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const handleFetchStories = useCallback(async () => {    
    dispatchStories({ type: 'STORIES_FETCH_INIT' })
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);
      
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        }
      })
    }
    catch { 
      dispatchStories({ type: 'STORIES_FETCH_FAILURE'})
    }
  }, [urls]);

  useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories]);

  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    })
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleLastSearch = (searchTerm: string) => {
    handleSearch(searchTerm, 0);
    setSearchTerm(searchTerm);
  };
  const lastSearches = getLastSearches(urls);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    handleSearch(searchTerm, 0);
    event.preventDefault();
  }

  const handleSearch = (searchTerm: string, page: number) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  };

  const handleNextPage = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  }

  const sumComments = useMemo(() => getSumComments(stories),[
  stories
]);

  return (
    <div className="container">
      <h1 className="headline-primary"> My Hacker Stories with {sumComments} comments.</h1>
      <SearchForm 
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {lastSearches.map((url, index) => (
        <button key={url + index} type="button" onClick={() => handleLastSearch(url)}>{url}</button>
      ))}
      <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      {stories.isError && <p>Something went wrong...</p>}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <button type="button" onClick={handleNextPage}>
        Next
      </button>
      )}

      </div>
  );
}

export default App;