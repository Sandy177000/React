
import { useState, useEffect } from '../core/hooks';
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
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}
