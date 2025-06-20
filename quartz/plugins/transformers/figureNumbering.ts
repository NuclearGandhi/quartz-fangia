import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"

export interface Options {
  enableFigureNumbering: boolean
}

const defaultOptions: Options = {
  enableFigureNumbering: true,
}

interface FigureInfo {
  number: string
  id: string
  imagePath: string
}

const FIGURE_TEXT = {
  english: "Figure",
  hebrew: "איור"
}

export const FigureNumbering: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  // Extract file prefix for figure numbering (e.g., "SLD1_002" -> "2", "IRB1_HW003" -> "HW3")
  const getFilePrefix = (fileName: string): string => {
    const prefixMatch = fileName.match(/[A-Z]+\d+_([A-Z]*\d+)/i)
    if (prefixMatch && prefixMatch[1]) {
      // Remove leading zeros from numbers while preserving letters
      const prefix = prefixMatch[1].replace(/(\D*)0*(\d+)/, '$1$2')
      return prefix || '1'
    }
    return '1'
  }

  // Detect if content is Hebrew based on first heading
  const isHebrewContent = (content: string): boolean => {
    const headingMatch = content.match(/^#+\s+(.+)$/m)
    if (headingMatch && headingMatch[1]) {
      const firstChar = headingMatch[1].trim().charAt(0)
      return /[\u0590-\u05FF]/.test(firstChar)
    }
    return false
  }

  // Scan content for figures and create numbering
  const scanForFigures = (content: string, fileName: string): FigureInfo[] => {
    const isHebrew = isHebrewContent(content)
    const prefix = getFilePrefix(fileName)
    const figureText = isHebrew ? FIGURE_TEXT.hebrew : FIGURE_TEXT.english

    // Find all figure references: ![[image.ext]]^figureID
    const figureRegex = /!\[\[([^\]]+\.(png|jpg|jpeg|gif|bmp|svg|webp|pdf)[^\]]*)\]\]\^figure([^\s\r\n]*)/gi
    const figures: FigureInfo[] = []
    let match
    let counter = 1

    while ((match = figureRegex.exec(content)) !== null) {
      const imagePath = match[1].trim()
      const figureId = match[3] || ''
      const figureNumber = `${figureText} ${prefix}.${counter}`

      figures.push({
        number: figureNumber,
        id: figureId,
        imagePath: imagePath
      })

      counter++
    }

    return figures
  }

  return {
    name: "FigureNumbering",
    markdownPlugins() {
      if (!opts.enableFigureNumbering) {
        return []
      }

      return [
        () => {
          return (tree: Root, file) => {
            // Get the original content to scan for figures
            const content = String(file.value || '')
            const fileName = file.stem || 'unknown'
            
            // Scan for figures in the content
            const figures = scanForFigures(content, fileName)
            
            if (figures.length === 0) {
              return
            }

            let figureIndex = 0
            const assignedFigures = new Set<string>()

            // Process blockquotes for figure captions
            visit(tree, 'blockquote', (node) => {
              if (node.children.length === 0) return

              const firstChild = node.children[0]
              if (firstChild.type !== 'paragraph') return

              const text = toString(firstChild)
              
              // Skip if caption already has a figure number
              if (/^(Figure|איור)\s+[\w\d.-]+:/.test(text)) {
                return
              }

              // Assign next available figure in document order
              if (figureIndex < figures.length) {
                const figure = figures[figureIndex]
                assignedFigures.add(figure.id)
                
                // Update the first text node to include figure number
                if (firstChild.children.length > 0 && firstChild.children[0].type === 'text') {
                  const textNode = firstChild.children[0]
                  textNode.value = `${figure.number}: ${textNode.value}`
                } else {
                  // Insert figure number at the beginning
                  firstChild.children.unshift({
                    type: 'text',
                    value: `${figure.number}: `
                  })
                }
                
                figureIndex++
              }
            })

            // Process links for figure references
            visit(tree, 'link', (node) => {
              const url = node.url
              if (!url.includes('#^figure')) return

              const figureMatch = url.match(/#\^figure([^\s&]*)/)
              if (!figureMatch) return

              const figureId = figureMatch[1]
              const figure = figures.find(f => f.id === figureId)
              
              if (figure && node.children.length > 0 && node.children[0].type === 'text') {
                // Update link text to show figure number
                node.children[0].value = figure.number
              }
            })

            // Process wikilinks for figure references (handle [[#^figure]] format)
            visit(tree, 'text', (node, index, parent) => {
              if (!parent || index === undefined) return

              const text = node.value
              const wikilinkFigureRegex = /\[\[#\^figure([^\]]*)\]\]/g
              
              if (wikilinkFigureRegex.test(text)) {
                // Split the text and replace figure references
                const parts = text.split(wikilinkFigureRegex)
                const newNodes = []
                
                for (let i = 0; i < parts.length; i++) {
                  if (i % 2 === 0) {
                    // Regular text
                    if (parts[i]) {
                      newNodes.push({
                        type: 'text',
                        value: parts[i]
                      })
                    }
                  } else {
                    // Figure ID
                    const figureId = parts[i]
                    const figure = figures.find(f => f.id === figureId)
                    if (figure) {
                      newNodes.push({
                        type: 'text',
                        value: figure.number
                      })
                    } else {
                      newNodes.push({
                        type: 'text',
                        value: `[[#^figure${figureId}]]`
                      })
                    }
                  }
                }
                
                // Replace the text node with the new nodes
                if (newNodes.length > 0) {
                  parent.children.splice(index, 1, ...newNodes as any[])
                }
              }
            })
          }
        }
      ]
    }
  }
} 