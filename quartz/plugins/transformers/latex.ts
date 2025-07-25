import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeMathjax from "rehype-mathjax/chtml"
//@ts-ignore
import rehypeTypst from "@myriaddreamin/rehype-typst"
import { QuartzTransformerPlugin } from "../types"
import { KatexOptions } from "katex"
import { Options as MathjaxOptions } from "rehype-mathjax/chtml"
//@ts-ignore
import { Options as TypstOptions } from "@myriaddreamin/rehype-typst"
import { min } from "d3"

interface Options {
  renderEngine: "katex" | "mathjax" | "typst"
  customMacros: MacroType
  katexOptions: Omit<KatexOptions, "macros" | "output">
  mathJaxOptions: Omit<MathjaxOptions, "macros" | "fontURL"> & { fontURL?: string }
  typstOptions: TypstOptions
}

interface MacroType {
  [key: string]: string
}

export const Latex: QuartzTransformerPlugin<Partial<Options>> = (opts) => {
  const engine = opts?.renderEngine ?? "katex"
  const macros = opts?.customMacros ?? {}
  return {
    name: "Latex",
    markdownPlugins() {
      return [
        [
          remarkMath, 
          { 
            singleDollarTextMath: true 
          }
        ]
      ]
    },
    htmlPlugins() {
      switch (engine) {
        case "katex": {
          return [[rehypeKatex, { output: "html", macros, ...(opts?.katexOptions ?? {}) }]]
        }
        case "typst": {
          return [[rehypeTypst, opts?.typstOptions ?? {}]]
        }
        case "mathjax": {
          const mathjaxOptions = {
            chtml: {
              fontURL: "/static/MathJax",
              scale: 1.1,
              minScale: 0.7
            },
            macros: macros,
            ...(opts?.mathJaxOptions ?? {})
          }
          return [[rehypeMathjax, mathjaxOptions]]
        }
        default: {
          const mathjaxOptions = {
            chtml: {
              fontURL: "/static/MathJax"
            },
            macros: macros,
            ...(opts?.mathJaxOptions ?? {})
          }
          return [[rehypeMathjax, mathjaxOptions]]
        }
      }
    },
    externalResources() {
      switch (engine) {
        case "katex":
          return {
            css: [{ content: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" }],
            js: [
              {
                // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
                src: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js",
                loadTime: "afterDOMReady",
                contentType: "external",
              },
            ],
          }
        case "mathjax":
          return {
            css: [],
            js: [],
          }
        default:
          return { 
            css: [],
            js: []
          }
      }
    },
  }
}
