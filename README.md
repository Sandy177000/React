## REACT-LITE
A lightweight React-like framework built from scratch in JavaScript. 
This educational project implements core React concepts including virtual DOM, fiber reconciliation, functional components, and hooks (useState, useEffect). 

-----
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


    b. ```workLoop(deadline)```

    - Processes units of work until browser needs to handle higher priority tasks
    - Each iteration calls ```performUnitOfWork``` and gets the next fiber
    - When all work is done, calls ```commitRoot``` to update the DOM
    - Reschedules itself for the next idle period

    c. ```performUnitOfWork(fiber)```

    - Determines if the fiber is a function component or host component
    - Calls the appropriate update function
    - Returns the next fiber to process (child, sibling, or parent's sibling)

    d. ```updateFunctionComponent(fiber)```

    - Sets up the hooks array for useState/useEffect
    - Calls the component function to get its rendered elements
    - Reconciles the returned elements with existing children

    e. ```updateHostComponent(fiber)```

    - Creates the actual DOM node if needed
    - Reconciles child elements

    f. ```reconcileChildren(wipFiber, elements)```

    - Compares new elements with existing fibers
    - Creates, updates, or flags fibers for deletion
    - Builds the fiber tree structure with parent-child-sibling relationships

    g. ```commitRoot()```
    - Processes all elements that need to be removed
    - Recursively commits DOM operations for the fiber tree
    - Saves the current fiber tree for future comparison
    
    h. ```commitWork(fiber)```

    - Performs the actual DOM operations based on effect tags
    - For PLACEMENT: adds new DOM nodes
    - For UPDATE: updates existing DOM node properties
    - For DELETION: removes DOM nodes
    - Processes all child and sibling fibers

---
3. When a state update occurs via setState from a useState hook:
    The scheduleUpdate function is called (registered as window.__REACT_SCHEDULE_UPDATE)
    A new work-in-progress root is created
    A new render cycle begins similarly to the initial render
    The component with updated state is re-rendered
    Changes are committed to the DOM


####  Complete Workflow Summary
    1. render(element, container) starts the process
    2. A fiber tree is gradually built through multiple workLoop iterations
    3. Components are processed based on their type (function or host)
    4. Elements are reconciled with existing fibers
    5. Once complete, changes are committed to the actual DOM
    4. State updates trigger new render cycles, repeating the process
    5. This entire workflow implements the core features of React in a way that:
        a. Enables incremental rendering
        b. Efficiently updates only what changed
        c. Preserves component state across renders
        d. Handles both function components and DOM elements
