// export function createElement(tag, props = {}, children = []) {
//   const el = document.createElement(tag);

//   Object.entries(props).forEach(([key, value]) => {
//     if (key.startsWith("on") && typeof value === "function") {
//       el.addEventListener(key.substring(2).toLowerCase(), value);
//     } else if (key === "className") {
//       el.className = value;
//     } else {
//       el.setAttribute(key, value);
//     }
//   });

//   if (typeof children === "string") {
//     el.textContent = children;
//   } else {
//     children.forEach((child) => {
//       if (typeof child === "string") {
//         el.appendChild(document.createTextNode(child));
//       } else {
//         el.appendChild(child);
//       }
//     });
//   }

//   return el;
// }

export function createElement(tag, props = {}, ...children) {
  const el = typeof tag === "string" ? document.createElement(tag) : tag;

  // Apply props if it's a fresh tag
  if (typeof tag === "string") {
    Object.entries(props || {}).forEach(([key, value]) => {
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === "className") {
        el.className = value;
      } else {
        el.setAttribute(key, value);
      }
    });
  }

  // Flatten children into array
  children = children.flat();

  children.forEach((child) => {
    if (child == null) return;
    if (typeof child === "string" || typeof child === "number") {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}
