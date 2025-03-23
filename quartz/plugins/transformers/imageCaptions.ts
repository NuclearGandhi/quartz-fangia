import { QuartzTransformerPlugin } from "../types"
import { Root, BlockContent, Paragraph, Image, Blockquote } from "mdast"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"

export interface Options {
  enableCaptions: boolean
  removeOriginalBlockquote: boolean
}

const defaultOptions: Options = {
  enableCaptions: true,
  removeOriginalBlockquote: true,
}

export const ImageCaptions: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "ImageCaptions",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, file) => {
            if (!opts.enableCaptions) return

            // Find image nodes in paragraphs
            const nodesToProcess: Array<{
              index: number
              parent: { children: BlockContent[] }
              imageNode: Paragraph
              blockquoteNode: Blockquote
            }> = []

            visit(tree, "paragraph", (node: Paragraph, index, parent) => {
              if (!parent || index === undefined || index >= parent.children.length - 1) return

              // Check if paragraph contains an image
              const imageChild = node.children.find((child) => child.type === "image")
              if (!imageChild) return

              // Check if next node is a blockquote directly
              const nextNode = parent.children[index + 1]
              if (nextNode.type !== "blockquote") return

              // Store this pair for processing
              nodesToProcess.push({
                index,
                parent: parent as { children: BlockContent[] },
                imageNode: node,
                blockquoteNode: nextNode as Blockquote,
              })
            })

            // Process nodes in reverse order to avoid index shifting issues
            for (const item of nodesToProcess.reverse()) {
              const { index, parent, imageNode, blockquoteNode } = item

              // Extract caption text from blockquote
              const captionText = toString(blockquoteNode)

              // Add caption to the image node's data
              const imgChild = imageNode.children.find(child => child.type === "image") as Image
              
              if (imgChild) {
                // Initialize data if it doesn't exist
                if (!imgChild.data) {
                  imgChild.data = {}
                }
                
                // Add caption property
                imgChild.data.caption = captionText
              }

              // Remove the original blockquote if needed
              if (opts.removeOriginalBlockquote) {
                parent.children.splice(index + 1, 1)
              }
            }
          }
        }
      ]
    }
  }
}
