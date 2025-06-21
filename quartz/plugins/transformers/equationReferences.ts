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
      /^\((\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)\)$/,                 // (4.13) or (BE3.5) or (B3.5) or (*3.5) or (LA3.6a)
      /^Eq\.?\s*(\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)$/i,            // Eq. 4.13 or Eq B3.5 or Eq. BE3.5a or Eq. *3.5
      /^Equation\s*(\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)$/i,         // Equation 4.13 or Equation B3.5 or Equation BE3.5a or Equation *3.5
      /^\(Eq\.?\s*(\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)\)$/i,        // (Eq. 4.13) or (Eq. B3.5) or (Eq. BE3.5a) or (Eq. *3.5)
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  // Extract equation reference from inline math content
  const extractEquationReferenceFromMath = (mathContent: string): string | null => {
    // Check for \text{(equation_ref)} patterns
    const textPatterns = [
      /\\text\s*\{\s*\((\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)\)\s*\}/,           // \text{(8.37)} or \text{(BE3.5)} or \text{(*3.5)}
      /\(\s*\\text\s*\{\s*(\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)\s*\}\s*\)/,     // (\text{8.37}) or (\text{BE3.5}) or (\text{*3.5})
    ]

    for (const pattern of textPatterns) {
      const match = mathContent.match(pattern)
      if (match) {
        return match[1]
      }
    }

    // Also check direct equation reference patterns
    return isEquationReference(mathContent.trim())
  }

  // Create a simple, CSS-safe equation ID
  const createEquationId = (equationNumber: string): string => {
    // Normalize dots and dashes to single dashes, handle multiple consecutive dashes
    const cleanNumber = equationNumber
      .toLowerCase()             // Convert to lowercase for consistency
      .replace(/[.\-:]+/g, '-')  // Replace one or more dots, dashes, or colons with single dash
      .replace(/^-+|-+$/g, '')   // Remove leading and trailing dashes
      .replace(/-+/g, '-');      // Replace multiple consecutive dashes with single dash
    return `eq-${cleanNumber}`;
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

            // First pass: Find math blocks with \tag{} and collect modifications
            const modificationsToApply: { parent: any, index: number, equation: EquationInfo }[] = []
            
            visit(tree, 'math', (node, index, parent) => {
              const mathContent = node.value
              const equationNumber = extractEquationNumber(mathContent)
              
              if (equationNumber && parent && parent.children && typeof index === 'number') {
                const equationId = createEquationId(equationNumber)
                
                // Collect the equation info and modification details
                modificationsToApply.push({
                  parent,
                  index,
                  equation: {
                    number: equationNumber,
                    id: equationId
                  }
                })
              }
            })
            
            // Helper function to check if we're in a list context and determine indentation
            const getListIndentation = (parent: any): string => {
              // Check if the immediate parent is a list item
              if (parent && parent.type === 'listItem') {
                return '\t'
              }
              
              // For now, we'll just handle direct list items
              // More complex nesting could be added later if needed
              return ''
            }
            
            // Apply modifications in reverse order to preserve indices
            for (let i = modificationsToApply.length - 1; i >= 0; i--) {
              const modification = modificationsToApply[i]
              const { parent, index, equation } = modification
              
              // Determine if we need indentation for list context
              const indentation = getListIndentation(parent)
              
              // Create block reference paragraph
              const blockRefParagraph = {
                type: 'paragraph',
                children: [{
                  type: 'text',
                  value: `${indentation}^${equation.id}`
                }]
              }
              
              // If there is indentation, insert the block reference inside the list, before the math block. Otherwise, insert it before the math block.
              if (indentation === '\t') {
                // Find the list item parent
                if (parent && parent.type === 'listItem') {
                  // Insert the block reference at the end of the list item
                  parent.children.push(blockRefParagraph)
                }
              } else {
                parent.children.splice(index, 0, blockRefParagraph)
              }
              
              // Collect equation for reference
              equations.push(equation)
            }

            // New pass: Handle cross-document equation references
            // Look for patterns like: [[link|משוואה]] $\text{(7.54)}$ or [[link|משוואות]] $\text{(SH8-27)}$ ו-$\text{(SH8-31)}$
            visit(tree, 'paragraph', (paragraphNode, paragraphIndex, paragraphParent) => {
              if (!paragraphNode.children || paragraphNode.children.length < 2) return

              for (let i = 0; i < paragraphNode.children.length; i++) {
                const currentNode = paragraphNode.children[i] as any

                // Check if current node is a link with משוואה/equation or משוואות/equations as display text
                if (currentNode.type === 'link') {
                  // Get the display text from the link's children
                  const displayText = currentNode.children && currentNode.children[0] && currentNode.children[0].type === 'text' 
                    ? currentNode.children[0].value 
                    : null
                  
                  if (displayText === 'משוואה' || displayText === 'equation' || displayText === 'משוואות' || displayText === 'equations') {
                    // Collect all equation references that follow
                    const equationRefs: { ref: string, nodeIndex: number }[] = []
                    const targetUrl = currentNode.url
                    const baseUrl = targetUrl.split('#')[0]
                    
                    // Look for inline math nodes and connective text
                    let j = i + 1
                    let lastProcessedIndex = i
                    
                    while (j < paragraphNode.children.length) {
                      const candidateNode = paragraphNode.children[j] as any
                      
                      if (candidateNode.type === 'inlineMath') {
                        const equationRef = extractEquationReferenceFromMath(candidateNode.value)
                        if (equationRef) {
                          equationRefs.push({ ref: equationRef, nodeIndex: j })
                          lastProcessedIndex = j
                          j++
                        } else {
                          break
                        }
                      } else if (candidateNode.type === 'text') {
                        const textContent = candidateNode.value.trim()
                        // Allow whitespace, Hebrew connectives (ו-, ו), and common connectives
                        if (textContent === '' || textContent === 'ו-' || textContent === 'ו' || textContent === 'and' || textContent === ',' || textContent === ':') {
                          j++
                        } else {
                          break
                        }
                      } else {
                        break
                      }
                    }
                    
                    if (equationRefs.length > 0) {
                      // Create replacement nodes
                      const replacementNodes: any[] = []
                      
                      // Start with the display text (no longer a link)
                      replacementNodes.push({
                        type: 'text',
                        value: displayText
                      })
                      
                      // Add space after display text
                      replacementNodes.push({
                        type: 'text',
                        value: ' '
                      })
                      
                      // Process nodes between link and equations, converting equation references to links
                      for (let k = i + 1; k <= lastProcessedIndex; k++) {
                        const node = paragraphNode.children[k] as any
                        
                        if (node.type === 'inlineMath') {
                          const equationRef = extractEquationReferenceFromMath(node.value)
                          if (equationRef) {
                            const equationId = createEquationId(equationRef)
                            const finalUrl = `${baseUrl}#${equationId}`
                            
                            // Create the cross-document equation link
                            replacementNodes.push({
                              type: 'link',
                              url: finalUrl,
                              children: [{
                                type: 'text',
                                value: `(${equationRef})`
                              }],
                              data: {
                                hProperties: {
                                  className: ['equation-reference', 'cross-document']
                                }
                              }
                            })
                          }
                        } else if (node.type === 'text') {
                          // Preserve connective text
                          replacementNodes.push({
                            type: 'text',
                            value: node.value
                          })
                        }
                      }
                      
                      // Calculate how many nodes to remove (from link to last processed node, inclusive)
                      const nodesToRemove = lastProcessedIndex - i + 1
                      
                      // Replace all the nodes
                      paragraphNode.children.splice(i, nodesToRemove, ...replacementNodes)
                      
                      // Adjust loop counter to skip the nodes we just added
                      i += replacementNodes.length - 1
                    }
                  }
                }
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
                // Find matching equation in current document
                const equation = equations.find(eq => eq.number === equationRef)
                
                // Create equation link (either to local equation or generic anchor)
                const equationId = equation ? equation.id : createEquationId(equationRef)
                const linkNode = {
                  type: 'link',
                  url: `#${equationId}`,
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
            })

            // Fourth pass: Process inlineMath nodes that contain \text{} patterns
            visit(tree, 'inlineMath', (node, index, parent) => {
              if (!parent || index === undefined) return

              const mathContent = node.value
              
              // Check for \text{(equation_ref)} patterns
              const textPatterns = [
                /\\text\s*\{\s*\((\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)\)\s*\}/,           // \text{(8.37)} or \text{(BE3.5)} or \text{(*3.5)}
                /\(\s*\\text\s*\{\s*(\*?[A-Z]{0,2}\d+(?:[.\-]\d+)*[a-z]?)\s*\}\s*\)/,     // (\text{8.37}) or (\text{BE3.5}) or (\text{*3.5})
              ]

              for (const pattern of textPatterns) {
                const match = mathContent.match(pattern)
                if (match) {
                  const equationRef = match[1]
                  
                  // Find matching equation in current document
                  const equation = equations.find(eq => eq.number === equationRef)
                  
                  // Create equation link (either to local equation or generic anchor)
                  const equationId = equation ? equation.id : createEquationId(equationRef)
                  const linkNode = {
                    type: 'link',
                    url: `#${equationId}`,
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
            })
          }
        }
      ]
    }
  }
} 