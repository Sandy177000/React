/**
 * Creates a virtual DOM element
 * @param {string|function} type - Element type (string for HTML elements, function for components)
 * @param {object} props - Element properties
 * @param  {...any} children - Child elements
 * @returns {object} Virtual DOM element
 */

function createElement(type, props = {}, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => 
          typeof child === "object" ? child : createTextElement(child)
        ),
      },
    };
}

/**
 * Creates a text element
 * @param {string|number} text - Text content
 * @returns {object} Virtual DOM text element
 */
function createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  }
  
export { createElement };