import React from 'react';
import renderer from 'react-test-renderer';

import { Stories, Story } from './App';
import List, { Item } from './List';

describe('List', () => {
  const list: Stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: '0',
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: '1',
    },
  ];

  const onRemove = (story: Story) => void 0;

  it('renders two items', () => {
    const component = renderer.create(<List list={list} onRemoveItem={onRemove} />);

    expect(component.root.findAllByType(Item).length).toEqual(2);
  });
});
