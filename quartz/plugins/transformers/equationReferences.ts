import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"

export interface Options {
  enableEquationReferences: boolean
}

const defaultOptions: Options = {
  enableEquationReferences: true,
}

interface EquationInfo {
  number: string
  id: string
}

export const EquationReferences: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  // Extract equation number from \tag{} command
  const extractEquationNumber = (mathContent: string): string | null => {
    const tagMatch = mathContent.match(/\\tag\{([^}]+)\}/);
    if (tagMatch) {
      const tagContent = tagMatch[1];
      // Remove parentheses if present and clean up
      return tagContent.replace(/[()]/g, '').trim();
    }
    return null;
  }

  // Check if text matches equation reference patterns
  const isEquationReference = (text: string): string | null => {
    const patterns = [
      /^\((\d+(?:[.\-]\d+)*)\)$/,                           // (4.13) or (4-13)
      /^\(([HWLPhlwlp]+\d+(?:[.\-]\d+)*)\)$/,               // (HW3.8) or (HW3-8) or (L2.5) or (P1-3)
      /^Eq\.?\s*(\d+(?:[.\-]\d+)*)$/i,                      // Eq. 4.13 or Eq 4-13
      /^Eq\.?\s*([HWLPhlwlp]+\d+(?:[.\-]\d+)*)$/i,          // Eq. HW3.8 or Eq HW3-8
      /^Equation\s*(\d+(?:[.\-]\d+)*)$/i,                   // Equation 4.13 or Equation 4-13
      /^Equation\s*([HWLPhlwlp]+\d+(?:[.\-]\d+)*)$/i,       // Equation HW3.8 or Equation HW3-8
      /^\(Eq\.?\s*(\d+(?:[.\-]\d+)*)\)$/i,                  // (Eq. 4.13) or (Eq. 4-13)
      /^\(Eq\.?\s*([HWLPhlwlp]+\d+(?:[.\-]\d+)*)\)$/i,      // (Eq. HW3.8) or (Eq. HW3-8)
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  // Create a MathJax-compatible equation ID from equation number
  const createEquationId = (equationNumber: string): string => {
    return `mjx-eqn:${equationNumber}`;
  }

  return {
    name: "EquationReferences",
    markdownPlugins() {
      if (!opts.enableEquationReferences) {
        return []
      }

      return [
        () => {
          return (tree: Root, file) => {
            const equations: EquationInfo[] = []

            // First pass: Find math blocks with \tag{} and add block references
            visit(tree, 'math', (node) => {
              const mathContent = node.value
              const equationNumber = extractEquationNumber(mathContent)
              
              if (equationNumber) {
                const equationId = createEquationId(equationNumber)
                
                // Don't add block reference since MathJax will create its own ID
                // Just track the equation for reference matching
                equations.push({
                  number: equationNumber,
                  id: equationId
                })
              }
            })

            // Also check inline math for tags (though less common)
            visit(tree, 'inlineMath', (node) => {
              const mathContent = node.value
              const equationNumber = extractEquationNumber(mathContent)
              
              if (equationNumber) {
                const equationId = createEquationId(equationNumber)
                
                // Don't add block reference since MathJax will create its own ID
                equations.push({
                  number: equationNumber,
                  id: equationId
                })
              }
            })

            if (equations.length === 0) {
              return
            }

            // Second pass: Find equation references and convert them to links
            visit(tree, 'text', (node, index, parent) => {
              if (!parent || index === undefined) return

              const text = node.value
              const equationRef = isEquationReference(text.trim())
              
              if (equationRef) {
                // Find matching equation
                const equation = equations.find(eq => eq.number === equationRef)
                
                                 if (equation) {
                   // Replace text node with a link
                   const linkNode = {
                     type: 'link',
                     url: `#${equation.id}`,
                     children: [{
                       type: 'text',
                       value: text
                     }],
                     data: {
                       hProperties: {
                         className: ['equation-reference']
                       }
                     }
                   }
                   
                   parent.children.splice(index, 1, linkNode as any)
                 }
              }
            })

            // Third pass: Handle equation references in inline math (like $(HW3.1)$)
            visit(tree, 'inlineMath', (node, index, parent) => {
              if (!parent || index === undefined) return

              const mathContent = node.value
              const equationRef = isEquationReference(mathContent.trim())
              
              if (equationRef) {
                // Find matching equation
                const equation = equations.find(eq => eq.number === equationRef)
                
                                 if (equation) {
                   // Replace inline math with a link
                   const linkNode = {
                     type: 'link',
                     url: `#${equation.id}`,
                     children: [{
                       type: 'text',
                       value: `(${equationRef})`
                     }],
                     data: {
                       hProperties: {
                         className: ['equation-reference']
                       }
                     }
                   }
                   
                   parent.children.splice(index, 1, linkNode as any)
                 }
              }
            })

            // Fourth pass: Process inlineMath nodes that contain \text{} patterns
            visit(tree, 'inlineMath', (node, index, parent) => {
              if (!parent || index === undefined) return

              const mathContent = node.value
              
              // Check for \text{(equation_ref)} patterns
              const textPatterns = [
                /\\text\s*\{\s*\((\d+(?:[.\-]\d+)*)\)\s*\}/,           // \text{(8.37)}
                /\\text\s*\{\s*\(([HWLPhlwlp]+\d+(?:[.\-]\d+)*)\)\s*\}/, // \text{(HW3.8)}
              ]

                             for (const pattern of textPatterns) {
                 const match = mathContent.match(pattern)
                 if (match) {
                   const equationRef = match[1]
                   const equation = equations.find(eq => eq.number === equationRef)
                   
                   if (equation) {
                     // Replace the inlineMath node with a link
                     const linkNode = {
                       type: 'link',
                       url: `#${equation.id}`,
                       children: [{
                         type: 'text',
                         value: `(${equationRef})`
                       }],
                       data: {
                         hProperties: {
                           className: ['equation-reference']
                         }
                       }
                     }
                     
                     parent.children.splice(index, 1, linkNode as any)
                     return // Exit early since we found a match
                   }
                 }
               }
            })
          }
        }
      ]
    }
  }
} 