import { QuartzFilterPlugin } from "../types"

export const RemoveExcalidraw: QuartzFilterPlugin<{}> = () => {
  console.log("[RemoveExcalidraw] Filter plugin initialized")
  return {
    name: "RemoveExcalidraw",
    shouldPublish(_ctx, [_tree, vfile]) {
      // Try different ways to get the file path
      const filePath = vfile.path || vfile.history?.[0] || vfile.basename || String(vfile)
      const isExcalidraw = filePath && (filePath.includes('excalidraw.md') || filePath.includes('.excalidraw.'))
      
      // Only log for excalidraw files to reduce noise
      if (isExcalidraw) {
        console.log(`[RemoveExcalidraw] FILTERING OUT excalidraw file: ${filePath}`)
      }
      
      return !isExcalidraw
    },
  }
}
