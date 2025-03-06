// TypeScript implementation of math handler for rebber

// Define interfaces for types
interface Node {
  type: string;
  data?: {
    hProperties?: {
      className?: string[] | string;
    };
  };
  value?: string;
  children?: Node[];
}

interface Context {
  math?: {
    [key: string]: (content: string) => string;
  };
}

// Default macros for math rendering
const defaultMacros: Record<string, (content: string) => string> = {
  inlineMath: (content: string) => `$${content}$`,
  inlineMathDouble: (content: string) => `$$${content}$$`,
  math: (content: string) => {
    if (content &&
      (content.trim().startsWith('\\begin{align}') ||
        content.trim().startsWith('\\begin{gather}'))) {
      return `${content} \n\n`;
    } else {
      return `\\[ ${content} \\]\n\n`
    }
  }
};

/**
 * Process and stringify math node for LaTeX output
 */
export default function math(ctx: Context, node: Node, index?: number, parent?: Node): string {
  let type = 'math';

  // Handle inline math differently based on its display class
  if (node.type === 'inlineMath') {
    try {
      const classes = node.data?.hProperties?.className;
      if (Array.isArray(classes)) {
        type = classes.includes('math-display') ? 'inlineMathDouble' : 'inlineMath';
      } else if (typeof classes === 'string') {
        type = classes.includes('math-display') ? 'inlineMathDouble' : 'inlineMath';
      }
    } catch (e) {
      console.error(e, 'This rebber math plugin is only compatible with remark-math.');
    }
  }

  // Special handling for align and gather environments

  // Determine which macro to use
  let macro: (content: string) => string;
  if (ctx.math && type in ctx.math) {
    macro = ctx.math[type];
  } else if (type in defaultMacros) {
    macro = defaultMacros[type];
  } else {
    macro = defaultMacros.math;
  }

  // Get the content - either from all() function or node value
  let content = '';
  try {
    // Import all function dynamically to avoid CommonJS/ESM issues
    const all = require('rebber/dist/all');
    content = all(ctx, node) || node.value || '';
  } catch (e) {
    // Fallback if all() fails
    content = node.value || '';
  }

  return macro(content.trim());
}
