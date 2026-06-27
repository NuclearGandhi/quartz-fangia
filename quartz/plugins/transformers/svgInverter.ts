import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"

export interface Options {
  // If we need options in the future, they would go here
}

/**
 * Plugin that adds the 'full-invert' class to SVG images
 */
export const SvgInverter: QuartzTransformerPlugin<Partial<Options>> = (_userOpts) => {
  return {
    name: "SvgInverter",
    htmlPlugins() {
      return [
        () => {
          return (tree) => {
            visit(tree, "element", (node) => {
              const alt = node.properties?.alt
              if (
                node.tagName === "img" &&
                node.properties &&
                typeof node.properties.src === "string" &&
                node.properties.src.toLowerCase().endsWith(".svg") &&
                alt !== "bookhue"
              ) {
                // Add the 'full-invert' class to SVG images
                node.properties.className = node.properties.className || []
                if (Array.isArray(node.properties.className)) {
                  node.properties.className.push("full-invert")
                } else if (typeof node.properties.className === "string") {
                  node.properties.className = [node.properties.className, "full-invert"]
                } else {
                  node.properties.className = ["full-invert"]
                }
              }
            })
          }
        },
      ]
    },
  }
}