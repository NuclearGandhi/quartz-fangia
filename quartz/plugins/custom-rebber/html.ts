import { parse } from 'node-html-parser';

/**
 * Converts HTML nodes to LaTeX
 */
export default function html(ctx: any, node: any) {
  // If node has no value, return empty string
  if (!node.value) return '';

  // Parse the HTML content
  const root = parse(node.value);
  
  // Check if it's a callout block title
  const calloutTitle = root.querySelector('.callout-title');
  if (calloutTitle) {
    // Extract the title text
    const titleInner = calloutTitle.querySelector('.callout-title-inner');
    let titleText = '';
    if (titleInner) {
      titleText = titleInner.text.trim();
    }
    
    // Get the parent node to determine callout type
    const parentNode = ctx.parent;
    let calloutType = '';
    
    if (parentNode && parentNode.data && parentNode.data.hProperties) {
      const className = parentNode.data.hProperties.className || '';
      if (typeof className === 'string' && className.includes('callout ')) {
        calloutType = className.split('callout ')[1];
      }
    }
    
    // Generate appropriate LaTeX based on callout type
    // switch (calloutType) {
    //   case 'example':
    //     return `\\begin{ExampleBox}{${titleText}}\\end{ExampleBox}`;
    //   case 'notes':
    //     return `\\begin{NotesBox}{${titleText}}\\end{NotesBox}`;
    //   case 'question':
    //     return `\\begin{QuestionBox}{${titleText}}\\end{QuestionBox}`;;
    //   case 'warning':
    //     return `\\begin{WarningBox}{${titleText}}\\end{WarningBox}`;
    //   case 'error':
    //     return `\\begin{ErrorBox}{${titleText}}\\end{ErrorBox}`;
    //   default:
    //     return `\\begin{InfoBox}{${titleText}}\\end{InfoBox}`;
    // }

    return titleText;
  }
  
  // Handle other HTML content
  // For unsupported HTML, just return an empty string or a comment
  return `% Unsupported HTML: ${node.value.replace(/\n/g, ' ').trim()}\n`;
}
