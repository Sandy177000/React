// src/index.js
import { createElement } from './core/element';
import { render } from './core/renderer';
import { useState, useEffect } from './core/hooks';

window.createElement = createElement;
window.render = render;
window.useState = useState;
window.useEffect = useEffect;

const React = { 
  createElement,
  render,
  useState,
  useEffect
};

export default React;