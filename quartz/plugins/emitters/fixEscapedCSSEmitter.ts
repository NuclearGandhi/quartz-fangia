import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

export const FixEscapedCSSEmitter: QuartzEmitterPlugin = () => {
  return {
    name: "FixEscapedCSSEmitter",
    getQuartzComponents() {
      return []
    },
    async getDependencyGraph() {
      return new Map()
    },
    async *emit(ctx, content, _resources) {
      for (const [_tree, file] of content) {
        const slug = file.data.slug!
        
        // Skip non-HTML files
        if (!slug.endsWith(".html") && !file.data.filePath?.endsWith(".html")) {
          continue
        }
        
        // Get the HTML content from the file
        let htmlContent = file.value as string
        
        // Fix escaped quotes in CSS
        if (htmlContent && htmlContent.includes('&quot;')) {
          console.log(`FixEscapedCSSEmitter: Found escaped quotes in ${slug}, fixing...`)
          const fixedContent = htmlContent.replace(/&quot;/g, '"')
          
          // Write the fixed content
          yield write({
            ctx,
            slug: slug as FullSlug,
            ext: ".html",
            content: fixedContent
          })
        }
      }
    },
  }
}
