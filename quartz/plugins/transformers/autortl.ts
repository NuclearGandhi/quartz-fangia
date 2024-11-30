// An auto-RTL transformer for Quartz - just adds a `dir` attribute to all elements with text content.

import { QuartzTransformerPlugin } from "../types"

export interface Options {
}

const defaultOptions: Options = {
}

export const AutoRTL: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "AutoRTL",
    htmlPlugins() {
      return [
        () => {
          return (tree) => {
            tree.children.forEach((node: any) => {
              const applicableTags = ["div", "p", "ul", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "span"]
              if (applicableTags.includes(node.tagName)) {
                node.properties = { ...(node.properties ?? {}), dir: "auto" }
              }
            })
          }
        },
      ]
      return []
    },
  }
}