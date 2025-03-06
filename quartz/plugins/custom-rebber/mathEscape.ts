/**
 * Simple preprocessor that replaces \pu{} commands with \si{} in LaTeX
 * This is specifically for unit formatting in scientific/engineering documents
 */
export default function mathEscape() {
  return (node: { value: string }): void => {
    // Replace \pu{} with \si{}
    if (!node.value) return;

    // Handle simple cases first
    node.value = node.value.replace(/\\pu\s*{([^{}]*)}/g, '\\si{$1}');
    
    // Handle nested braces case by iteratively replacing until no changes
    let hasChanged = true;
    let result = node.value;
    
    while (hasChanged) {
      const newResult = result.replace(/\\pu\s*{((?:[^{}]|{[^{}]*})+)}/g, '\\si{$1}');
      hasChanged = newResult !== result;
      result = newResult;
    }
    
    node.value = result;
  };
}
