import { sortBy } from "lodash";
import { useState } from "react";
import { Stories, Story } from "./App";
import { ReactComponent as Check } from './check.svg';


type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}
  
type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
}

const SORTS: { [name: string]: (stories: Stories) => Stories} = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, 'title'),
  AUTHOR: (list) => sortBy(list, 'author'),
  COMMENT: (list) => sortBy(list, 'num_comments').reverse(),
  POINT: (list) => sortBy(list, 'points').reverse(),
}

  
const List = ({ list, onRemoveItem }: ListProps) => {
    const [sort, setSort] = useState({sortKey: 'NONE', isReverse: false});

    const handleSort = (sortKey: string) => {
      const isReverse = sort.sortKey === sortKey && !sort.isReverse;
      setSort({ sortKey, isReverse });
    };

    const sortFunction = SORTS[sort.sortKey];
    let sortedList = !sort.isReverse ? sortFunction(list) : sortFunction(list).reverse();

    return (<>
    <div className="item">
      <button 
        style={{ width: '40%' }} 
        onClick={() => handleSort('TITLE')}>Title</button>
      <button style={{ width: '30%' }} onClick={() => handleSort('AUTHOR')}>Author</button>
      <button style={{ width: '10%' }} onClick={() => handleSort('COMMENT')}>Number of comments</button>
      <button style={{ width: '10%' }} onClick={() => handleSort('POINT')}>Points</button>
      <span style={{ width: '10%' }}>Remove</span>
    </div>
        {sortedList.map(item => (<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>))}
        </>
  );
};
  
export const Item = ({ item, onRemoveItem }: ItemProps) => (
<div className="item" key={item.objectID}>
    <span style={{ width: '40%' }}>
    <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>
    <button 
        type="button" 
        onClick={() => onRemoveItem(item)}
        className="button button_small">
        Delete

        <Check height="18px" width="18px"/>
    </button>
    </span>
    </div>
)

export default List;
