import { QuartzTransformerPlugin } from "../types"
import { Root } from "hast"
import { visit } from "unist-util-visit"
import { Element } from "hast"

interface Options {
  /** Whether to apply course link direction transformation */
  enableDirection: boolean
}

const defaultOptions: Options = {
  enableDirection: true,
}

// Helper function to detect Hebrew text
function containsHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text)
}

// Helper function to extract the actual course/chapter title from link text
function extractContentTitle(linkText: string): string {
  // Pattern: COURSE_CODE_XXX (where XXX can be 000, 001, HW001, E2021WA, etc.) followed by the actual title
  // Examples: "GCH1_001 רקע ומושגי יסוד", "CAL1_005 גבולות", "FLD1_HW001 תרגיל בית 1"
  const match = linkText.match(/^[A-Z]{2,4}\d+_[A-Z0-9]+\s+(.+)$/)
  return match ? match[1].trim() : linkText
}

// Helper function to check if we're processing a _000 course overview page
function isCourseOverviewPage(slug: string): boolean {
  return /_000/.test(slug)
}

export const CourseLinkDirection: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  
  return {
    name: "CourseLinkDirection",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree: Root, file) => {
            // Only apply to _000 course overview pages
            if (!isCourseOverviewPage(file.data.slug!)) {
              return
            }
            
            if (!opts.enableDirection) {
              return
            }

            // Find all ul elements and analyze their content direction
            visit(tree, "element", (node) => {
              if (node.tagName === "ul") {
                // Collect all course/chapter links in this ul
                const courseLinkTexts: string[] = []
                
                visit(node, "element", (linkNode) => {
                  if (
                    linkNode.tagName === "a" &&
                    linkNode.properties &&
                    linkNode.properties.className &&
                    Array.isArray(linkNode.properties.className) &&
                    linkNode.properties.className.includes("internal") &&
                    linkNode.children.length === 1 &&
                    linkNode.children[0].type === "text"
                  ) {
                    const linkText = linkNode.children[0].value
                    const contentTitle = extractContentTitle(linkText)
                    
                    // Consider any link that has extractable content or any internal link in the ul
                    if (contentTitle !== linkText) {
                      courseLinkTexts.push(contentTitle)
                    } else {
                      // If it doesn't match our pattern but is an internal link, use the full text for language detection
                      courseLinkTexts.push(linkText)
                    }
                  }
                })
                
                // If we found course links, determine the dominant direction
                if (courseLinkTexts.length > 0) {
                  let hebrewCount = 0
                  let latinCount = 0
                  
                  courseLinkTexts.forEach(title => {
                    if (containsHebrew(title)) {
                      hebrewCount++
                    } else {
                      latinCount++
                    }
                  })
                  
                  // Set direction based on majority, with Hebrew as default if equal
                  const direction = hebrewCount >= latinCount ? "rtl" : "ltr"
                  
                  // Set the dir attribute on the ul
                  if (!node.properties) {
                    node.properties = {}
                  }
                  node.properties.dir = direction
                }
              }
            })
          }
        },
      ]
    },
  }
} 