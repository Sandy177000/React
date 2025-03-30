import { setCurrentComponent } from "./hooks";


let currentRoot = null;
let wipRoot = null;
let nextUnitOfWork = null;
let deletions = null;


/**
 * Renders a virtual element to a DOM container
 * @param {object} element - Virtual DOM element
 * @param {HTMLElement} container - DOM container
 */
function render(element, container) {
    wipRoot = {
      type: 'ROOT',
      dom: container,
      props: {
        children: [element],
      },
      alternate: currentRoot,
    };
    
    deletions = [];
    nextUnitOfWork = wipRoot;
    
    // Start the work loop
    requestIdleCallback(workLoop);
}

/**
 * Creates a DOM node from a virtual element
 * @param {object} fiber - Fiber node
 * @returns {Node} DOM node
 */
function createDom(fiber) {
    const dom = 
      fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type);
    
    updateDom(dom, {}, fiber.props);
    
    return dom;
}


/**
 * Updates DOM properties
 * @param {Node} dom - DOM node
 * @param {object} oldProps - Old properties
 * @param {object} newProps - New properties
 */
function updateDom(dom, oldProps, newProps) {
    // Remove old properties
    Object.keys(oldProps).forEach(name => {
      if (name !== 'children' && !(name in newProps)) {
        if (name.startsWith('on')) {
          const eventType = name.toLowerCase().substring(2);
          dom.removeEventListener(eventType, oldProps[name]);
        } else {
          dom[name] = '';
        }
      }
    });
    
    // Set new or changed properties
    Object.keys(newProps).forEach(name => {
      if (name !== 'children' && oldProps[name] !== newProps[name]) {
        // Handle event listeners
        if (name.startsWith('on')) {
          const eventType = name.toLowerCase().substring(2);
          
          if (oldProps[name]) {
            dom.removeEventListener(eventType, oldProps[name]);
          }
          
          dom.addEventListener(eventType, newProps[name]);
        } else {
          // Regular property
          dom[name] = newProps[name];
        }
      }
    });
}

/**
 * Perform work when browser is idle
 * @param {IdleDeadline} deadline - Browser idle deadline
 */
function workLoop(deadline) {
    let shouldYield = false;
    
    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }
    
    // If we've finished all work, commit the changes
    if (!nextUnitOfWork && wipRoot) {
      commitRoot();
    }
    
    // Schedule next work cycle
    requestIdleCallback(workLoop);
}


/**
 * Updates a functional component
 * @param {object} fiber - Component fiber
 */
function updateFunctionComponent(fiber) {
    // Preserve hooks for this component
    fiber.hooks = fiber.alternate?.hooks || [];
    
    // Setup for hooks
    setCurrentComponent(fiber);
    
    // Get children from component function
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}


/**
 * Updates a host component (regular DOM element)
 * @param {object} fiber - Host component fiber
 */
function updateHostComponent(fiber) {
    // Create DOM if it doesn't exist
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    
    // Reconcile children
    reconcileChildren(fiber, fiber.props.children);
}
  
/**
 * Performs a unit of work and returns the next unit
 * @param {object} fiber - Current fiber
 * @returns {object|null} Next fiber to process
 */
function performUnitOfWork(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function';
    
    if (isFunctionComponent) {
      updateFunctionComponent(fiber);
    } else {
      updateHostComponent(fiber);
    }
    
    // Return next unit of work - first child, sibling, or uncle
    if (fiber.child) {
      return fiber.child;
    }
    
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
    
    return null;
}



/**
 * Reconciles old fibers with new elements
 * @param {object} wipFiber - Work in progress fiber
 * @param {Array} elements - New child elements
 */
function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
    
    while (index < elements.length || oldFiber) {
      const element = elements[index];
      let newFiber = null;
      
      // Compare old fiber to element
      const sameType = oldFiber && 
        element && 
        element.type === oldFiber.type;
      
      // Update node if same type
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: 'UPDATE',
        };
      }
      
      // Create new node if different type
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: 'PLACEMENT',
        };
      }
      
      // Delete old node if different type
      if (oldFiber && !sameType) {
        oldFiber.effectTag = 'DELETION';
        deletions.push(oldFiber);
      }
      
      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }
      
      // Add to fiber tree
      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element) {
        prevSibling.sibling = newFiber;
      }
      
      prevSibling = newFiber;
      index++;
    }
}


/**
 * Commit changes to the DOM
 */
function commitRoot() {
    // Handle deletions
    deletions.forEach(commitWork);
    
    // Commit the actual changes
    commitWork(wipRoot.child);
    
    // Save current root for next update
    currentRoot = wipRoot;
    wipRoot = null;
}


/**
 * Find the parent DOM node for a fiber
 * @param {object} fiber - Fiber to find parent for
 * @returns {Node} Parent DOM node
 */
function findDomParent(fiber) {
    let domParentFiber = fiber.parent;
    
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
    }
    
    return domParentFiber.dom;
}


/**
 * Recursively commit work from a fiber
 * @param {object} fiber - Fiber to commit
 */
function commitWork(fiber) {
    if (!fiber) return;
    
    // Find closest parent with a DOM node
    const domParent = findDomParent(fiber);
    
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
      updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === 'DELETION') {
      commitDeletion(fiber, domParent);
    }
    
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

/**
 * Commit deletion of a fiber
 * @param {object} fiber - Fiber to delete
 * @param {Node} domParent - Parent DOM node
 */
function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
      domParent.removeChild(fiber.dom);
    } else {
      // For function components that don't have DOM
      commitDeletion(fiber.child, domParent);
    }
}

// Register the update scheduler for hooks
window.__REACT_SCHEDULE_UPDATE = (fiber) => {
  // Create a new work in progress root
  wipRoot = {
    type: currentRoot.type,
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  
  nextUnitOfWork = wipRoot;
  deletions = [];
  
  // Start the work loop
  requestIdleCallback(workLoop);
};
  
export { render };