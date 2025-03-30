
import { useState, useEffect } from '../core/hooks';
import React from '../index';
// Counter component using hooks
export default function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
    // Cleanup function
    return () => {
      document.title = 'Mini React App';
    };
  }, [count]);
  
  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, `Count: ${count}`),
    React.createElement(
      'button',
      { onClick: () => setCount(count + 1) },
      'Increment'
    ),
    React.createElement(
      'button',
      { onClick: () => setCount(count - 1) },
      'Decrement'
    ),
    React.createElement(
        'div',
        { className: 'counter' },
        React.createElement('h1', { style: { color: 'red' }}, `Hello world`),
    )
  );
}
