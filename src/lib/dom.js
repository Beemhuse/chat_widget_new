// src/lib/dom.js
export function createElement(tag, props = {}, children = []) {
  const el = document.createElement(tag);

  // assign props
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      el.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  // normalize children
  if (!Array.isArray(children)) children = [children];

  for (const child of children) {
    if (child == null || child === false) continue; // skip null/false

    if (typeof child === "string" || typeof child === "number") {
      el.appendChild(document.createTextNode(child));
    } 
    else if (child instanceof Node) {
      el.appendChild(child);
    } 
    else if (child && typeof child === "object" && child.__isElement && child.node instanceof Node) {
      el.appendChild(child.node);
    } 
    else {
      // 🚨 Instead of breaking, warn and skip
      console.warn("⚠️ Unsupported child passed to createElement:", child);
    }
  }

  // return a wrapped element (so other helpers can detect it)
  return Object.assign(el, { __isElement: true, node: el });
}
