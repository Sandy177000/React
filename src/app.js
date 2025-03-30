// src/app.js
import Counter from './components/Counter';
import React from './index';

// App component
function App() {
  return React.createElement(
    'div',
    { className: 'app' },
    React.createElement('h1', null, 'React Framework'),
    React.createElement(Counter)
  );
}

// Render the app
const container = document.getElementById('root');
React.render(React.createElement(App), container);