import { QuartzConfig } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import { FileTrieNode } from "./fileTrie"
import { FilePath, FullSlug } from "./path"

export interface Argv {
  directory: string
  verbose: boolean
  // Build command arguments
  output: string
  serve: boolean
  watch: boolean
  port: number
  baseDir?: string
  wsPort: number
  remoteDevHost?: string
  bundleInfo?: boolean
  fastRebuild?: boolean
  concurrency?: number
  // Convert command arguments
  file?: string
  format?:  "latex" | "mdast" | "hast"
}

export type BuildTimeTrieData = QuartzPluginData & {
  slug: string
  title: string
  filePath: string
}

export interface BuildCtx {
  buildId: string
  argv: Argv
  cfg: QuartzConfig
  allSlugs: FullSlug[]
  allFiles: FilePath[]
  trie?: FileTrieNode<BuildTimeTrieData>
  incremental: boolean
}

export function trieFromAllFiles(allFiles: QuartzPluginData[]): FileTrieNode<BuildTimeTrieData> {
  const trie = new FileTrieNode<BuildTimeTrieData>([])
  allFiles.forEach((file) => {
    if (file.frontmatter) {
      trie.add({
        ...file,
        slug: file.slug!,
        title: file.frontmatter.title,
        filePath: file.filePath!,
      })
    }
  })

  return trie
}

export type WorkerSerializableBuildCtx = Omit<BuildCtx, "cfg" | "trie">
