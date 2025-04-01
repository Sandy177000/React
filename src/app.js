// src/app.js
import './styles.css';
import React from './index';
import Counter from './components/Counter';

// App component
function App() {
  return (
    <div className="app">
      <h1>React Framework</h1>
      <Counter />
    </div>
  );
}

// Render the app
const container = document.getElementById('root');
React.render(<App />, container);