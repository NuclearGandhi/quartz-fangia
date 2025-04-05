import { QuartzTransformerPlugin } from "../types"
import { Root, BlockContent, Paragraph, Image, Blockquote } from "mdast"
import { Element, Root as HtmlRoot, ElementContent } from "hast"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"
import { toHast } from "mdast-util-to-hast"
import { toHtml } from "hast-util-to-html"
import { Raw } from "mdast-util-to-hast/lib/handlers/html"

export interface Options {
  enableCaptions: boolean
  markOriginalBlockquoteToBeIgnored: boolean
  removeOriginalBlockquote: boolean
}

const defaultOptions: Options = {
  enableCaptions: true,
  markOriginalBlockquoteToBeIgnored: true,
  removeOriginalBlockquote: false,
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

              // Create a paragraph node for the caption
              const captionNode: Paragraph = {
                type: "paragraph",
                children: blockquoteNode.children.flatMap(child => child.type === "paragraph" ? child.children : []),
              }

              // Add caption to the image node's data
              const imgChild = imageNode.children.find(child => child.type === "image") as Image

              if (imgChild) {
                // Initialize data if it doesn't exist
                if (!imgChild.data) {
                  imgChild.data = {}
                }

                // Add caption property
                imgChild.data.caption = captionNode
              }

              // Remove the blockquote node from the parent
              if (opts.removeOriginalBlockquote) {
                parent.children.splice(index + 1, 1)
              } else {
                if (!blockquoteNode.data) {
                  blockquoteNode.data = {}
                }
                if (!blockquoteNode.data.hProperties) {
                  blockquoteNode.data.hProperties = { className: [] }
                }
                if (!Array.isArray(blockquoteNode.data.hProperties.className)) {
                  blockquoteNode.data.hProperties.className = []
                }
                blockquoteNode.data.hProperties.className.push("blockquote-caption")
              }

              // Mark the original blockquote to be ignored for latex
              if (opts.markOriginalBlockquoteToBeIgnored) {
                if (!blockquoteNode.data) {
                  blockquoteNode.data = {}
                }
                blockquoteNode.data.latexIgnore = true
              }
            }
          }
        }
      ]
    }
  }
}
