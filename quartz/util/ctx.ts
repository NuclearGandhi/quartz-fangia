import { QuartzConfig } from "../cfg"
import { FullSlug } from "./path"

export interface Argv {
  directory: string
  verbose: boolean
  // Build command arguments
  output: string
  serve?: boolean
  baseDir?: string
  port?: number
  wsPort?: number
  remoteDevHost?: string
  bundleInfo?: boolean
  fastRebuild?: boolean
  concurrency?: number
  // Convert command arguments
  file?: string
  format?:  "latex" | "mdast" | "hast"
}

export interface BuildCtx {
  buildId: string
  argv: Argv
  cfg: QuartzConfig
  allSlugs: FullSlug[]
}
