The framework consists of three main parts:
1. Virtual DOM Creation (element.js)
2. Rendering and Reconciliation (renderer.js)
3. Hooks System (hooks.js)

---


1. Element Creation (element.js)

    a. ```createElement(type, props, ...children)```
     - returns a JS object and returns it
     - this object is what we call a virtual dom element
     - children : Array, contains child objects

    b. ```createTextElement(text)```
     - returns a JS object with type "TEXT_ELEMENT" and nodeValue set as text with no child


---

2. Rendering System (renderer.js)

    a. ```render(element, container)```
    
    Fiber : A Datastructure / node in component tree
    ```js 
    {
        type: 'div' | 'TEXT_ELEMENT' | Function,  // Type of element
        props: {...},                             // Element properties
        dom: DOMNode | null,                      // Reference to actual DOM node
        parent: Fiber | null,                     // Parent fiber
        child: Fiber | null,                      // First child fiber
        sibling: Fiber | null,                    // Next sibling fiber
        alternate: Fiber | null,                  // Pointer to fiber in the other tree (current/WIP)
        effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION'  // What DOM operation to perform
    }
    ```

    - Initializes a root fiber called ```wipRoot``` which will be rendered inside the root container.
    - Initializes deletions array.
    - Initializes nextUnitOfWork as wipRoot
    - Makes a call to ```requestIdCallback(workLoop)```
      - This makes browser work when it is not busy with High priority tasks


