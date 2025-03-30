// src/index.js
import { createElement } from './core/element';
import { render } from './core/renderer';
import { useState, useEffect } from './core/hooks';

// Create our Mini-React API
const React = {
  createElement,
  render,
  useState,
  useEffect
};

export default React;