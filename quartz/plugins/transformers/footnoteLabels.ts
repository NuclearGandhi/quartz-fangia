import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import { Root } from "hast"

export interface Options {
  // If we need options in the future, they would go here
  customLabel?: string
}

const defaultOptions: Options = {
  customLabel: "הערות שוליים"
}

/**
 * Plugin that changes the text content of the footnote label to Hebrew
 */
export const HebrewFootnoteLabels: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "HebrewFootnoteLabels",
    htmlPlugins() {
      return [
        () => {
          return (tree: Root) => {
            visit(tree, "element", (node) => {
              if (
                node.tagName === "h2" && 
                node.properties && 
                node.properties.id === "footnote-label"
              ) {
                // Find the text node inside the section and replace its content
                visit(node, "text", (textNode) => {
                  textNode.value = opts.customLabel ?? defaultOptions.customLabel ?? ""
                })
              }
            })
          }
        },
      ]
    },
  }
}