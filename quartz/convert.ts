import sourceMapSupport from "source-map-support"
sourceMapSupport.install(options)
import path from "path"
import fs from "fs"
import { PerfTimer } from "./util/perf"
import { createMdProcessor, createFileParser, createMarkdownParser, createHtmlProcessor } from "./processors/parse"
import { FilePath } from "./util/path"
import { Argv, BuildCtx } from "./util/ctx"
import { options } from "./util/sourcemap"
import chalk from "chalk"
import { createRequire } from 'module'
import { QuartzLogger } from "./util/log"
import { ConvertResources } from "./plugins/transformers/convertResources"
import math from "./plugins/custom-rebber/math"
import mathEscape from "./plugins/custom-rebber/mathEscape"
import html from "./plugins/custom-rebber/html"
import { blockquote } from "./plugins/custom-rebber/blockquote"

// Create a require function for loading CommonJS modules
const require = createRequire(import.meta.url)

/**
 * Function to safely convert MDAST to LaTeX using rebber
 * This handles the ESM/CommonJS compatibility issues with rebber
 */
function mdastToLatex(ast: any, options: any = {}): string {
  try {
    // Get the Node.js module system
    const Module = require('module')

    // Create our visit mock function
    function visitMock(tree: any, test: any, visitor: any) {
      // If only two arguments are provided, the second is the visitor
      if (!visitor && typeof test === 'function') {
        visitor = test
        test = null
      }

      // Helper to visit a node and its children
      function visitNode(node: any, index: number | null, parent: any) {
        // Skip non-objects
        if (!node || typeof node !== 'object') return true

        // Check if this node matches the test
        let matches = !test
        if (typeof test === 'string') {
          matches = node.type === test
        } else if (typeof test === 'object' && test !== null) {
          matches = node.type === test.type
        } else if (typeof test === 'function') {
          matches = test(node, index, parent)
        }

        // Call visitor if we have a match
        if (matches && visitor) {
          const result = visitor(node, index, parent)
          // If visitor returns false, stop traversal
          if (result === false) return false
        }

        // Visit children
        if (Array.isArray(node.children)) {
          for (let i = 0; i < node.children.length; i++) {
            const childResult = visitNode(node.children[i], i, node)
            if (childResult === false) return false
          }
        }

        return true
      }

      visitNode(tree, null, null)
    }

    // Find the path to unist-util-visit in the node_modules folder
    const visitModulePath = require.resolve('unist-util-visit')

    // Inject our mock directly into the module cache
    // This makes `require('unist-util-visit')` return our mock function
    Module._cache[visitModulePath] = {
      id: visitModulePath,
      exports: visitMock, // Export the function directly, not as a property
      loaded: true,
      children: []
    }

    // Now require rebber with our mock in place
    const rebber = require('rebber')

    // Clean up by removing our mock from the cache
    delete Module._cache[visitModulePath]

    // Convert to LaTeX
    return rebber.toLaTeX(ast, options)
  } catch (err: any) {
    console.error(`Error in LaTeX conversion: ${err.message}`)
    if (err.stack) {
      console.error(err.stack)
    }
    throw err
  }
}

/**
 * Converting markdown to various formats
 */
export async function convertMarkdown(argv: Argv) {
  const perf = new PerfTimer()
  const log = new QuartzLogger(argv.verbose)

  // Get the file path
  if (!argv.file) {
    console.error(chalk.red(`File argument is missing`))
    process.exit(1)
  }
  const filePath = path.resolve(argv.file) as FilePath
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`File not found: ${filePath}`))
    process.exit(1)
  }

  console.log(`Processing file: ${filePath}`)

  // Create output directory
  const outputDir = path.resolve(argv.output)
  if (!fs.existsSync(outputDir)) {
    await fs.promises.mkdir(outputDir, { recursive: true })
  }

  // Set up build context
  const ctx: BuildCtx = {
    buildId: Math.random().toString(36).substring(2, 8),
    argv,
    cfg: (await import("../quartz.config.js")).default,
    allSlugs: []
  }

  // Add the ConvertResources plugin specifically for the convert command
  ctx.cfg.plugins.transformers.push(ConvertResources({
    outputDir: outputDir,
    copyResources: true,
    resourcesDir: "resources",
    logLevel: argv.verbose ? "verbose" : "normal"
  }))

  try {
    log.start("Parsing markdown file")

    // Use the existing file parser to parse the markdown file - just like parseMarkdown does internally
    const mdProcessor = createMdProcessor(ctx)
    const fileParser = createFileParser(ctx, [filePath])
    const mdContent = await fileParser(mdProcessor)

    if (!mdContent || mdContent.length === 0) {
      console.error(chalk.red(`Failed to parse file: ${filePath}`))
      process.exit(1)
    }

    // Get the first parsed file content
    const [ast, vfile] = mdContent[0]

    log.end(`Parsed markdown file in ${perf.timeSince()}`)

    // Generate output file based on format
    const title = path.basename(filePath, path.extname(filePath))
    const authors = ["Ido Fang Bentov"]

    const fileName = title.replace(/[^a-zA-Z0-9]/g, '')
    let outputFile: string, outputContent: string

    // Process according to format
    if (argv.format === "latex") {
      try {
        log.start("Converting to LaTeX")

        const sanitizeUrl = (url: string) => url.replace(/[{}]/g, '')

        const all = require('rebber/dist/all')
        const one = require('rebber/dist/one')

        const rebberConfig = {
          preprocessors: {
            inlineMath: [mathEscape],
            inlineMathDouble: [mathEscape],
            math: [mathEscape],
          },
          overrides: {
            yaml: () => '', // Ignore YAML frontmatter

            abbr: require('rebber-plugins/dist/type/abbr'),
            comments: require('rebber-plugins/dist/type/comments'),
            conclusion: require('rebber-plugins/dist/type/conclusion'),
            emoticon: require('rebber-plugins/dist/type/emoticon'),
            figure: require('rebber-plugins/dist/type/figure'),
            gridTable: require('rebber-plugins/dist/type/gridTable'),
            inlineMath: require('rebber-plugins/dist/type/math'),
            introduction: require('rebber-plugins/dist/type/introduction'),
            kbd: require('rebber-plugins/dist/type/kbd'),
            math: math,
            ping: require('rebber-plugins/dist/type/ping'),
            sub: require('rebber-plugins/dist/type/sub'),
            sup: require('rebber-plugins/dist/type/sup'),
            tableHeader: require('rebber-plugins/dist/type/tableHeader'),

            footnote: require('rebber-plugins/dist/type/footnote'),
            footnoteDefinition: require('rebber-plugins/dist/type/footnoteDefinition'),
            footnoteReference: require('rebber-plugins/dist/type/footnoteReference'),

            centerAligned: require('rebber-plugins/dist/type/align'),
            leftAligned: require('rebber-plugins/dist/type/align'),
            rightAligned: require('rebber-plugins/dist/type/align'),

            html: html,
            blockquote: (ctx: Context, node: Node) => blockquote(all, one, ctx, node),

            errorCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
            informationCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
            neutralCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
            questionCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
            secretCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
            warningCustomBlock: require('rebber-plugins/dist/type/customBlocks'),

            iframe: (ctx: any, node: any) => {
              const alternative = node.data.hProperties.src.includes('jsfiddle') ? 'Code' : 'Video'
              const caption = node.caption || ''
              return `\\iframe{${node.data.hProperties.src}}[${alternative}][${caption}]`
            }
          },
          codeAppendiceTitle: 'Annexes',
          customBlocks: {
            map: {
              error: 'Error',
              information: 'Information',
              question: 'Question',
              secret: 'Spoiler',
              warning: 'Warning',
              neutre: 'Neutral'
            }
          },
          image: {
            inlineImage: (node: any) => `\\inlineImage{${sanitizeUrl(node.url)}}`,
            image: (node: Node) => {
              if (node.url) {
                const caption = node.data?.caption ?? '';
                return `\\image{${sanitizeUrl(node.url)}}[${caption}]`;
              }
              return '';
            }
          },
          firstLineRowFont: '\\rowfont[l]{\\bfseries}',
          tableEnvName: 'zdstblr',
          figure: {
            image: (_1: any, _2: any, caption: any, extra: any) => `\\image{${sanitizeUrl(extra.url)}}${caption ? `[${caption}]` : ''}\n`
          },
          headings: [
            (val: any) => `\\levelOneTitle{${val}}\n`,
            (val: any) => `\\levelTwoTitle{${val}}\n`,
            (val: any) => `\\levelThreeTitle{${val}}\n`,
            (val: any) => `\\levelFourTitle{${val}}\n`,
            (val: any) => `\\levelFiveTitle{${val}}\n`,
            (val: any) => `\\levelSixTitle{${val}}\n`,
            (val: any) => `\\levelSevenTitle{${val}}\n`
          ]
        }

        const latexBody = mdastToLatex(ast, rebberConfig)

        const disableToc = false
        outputContent = `\\documentclass{fangiadocument}
\\usepackage{blindtext}
\\title{${title}}
\\author{${authors.join(', ')}}
\\graphicspath{ {resources/} }

\\begin{document}

${latexBody}
\\end{document}`
        outputFile = path.join(outputDir, `${fileName}.tex`)
        log.end(`LaTeX conversion completed in ${perf.timeSince()}`)
      } catch (error: any) {
        console.error(chalk.red(`Failed to convert to LaTeX: ${error.message}`))
        process.exit(1)
      }
    } else if (argv.format === "hast") {
      try {
        log.start("Converting to HAST")

        // Use the HTML processor to convert MDAST to HAST
        const markdownParser = createMarkdownParser(ctx, mdContent)
        const htmlProcessor = createHtmlProcessor(ctx)
        const processedContent = await markdownParser(htmlProcessor)

        if (!processedContent || processedContent.length === 0) {
          console.error(chalk.red(`Failed to convert to HAST`))
          process.exit(1)
        }

        // Get the HAST from the processed content
        const [hast, processedVFile] = processedContent[0]

        // Option 1: Output as JSON
        outputContent = JSON.stringify(hast, null, 2)
        outputFile = path.join(outputDir, `${fileName}.HAST.json`)

        // Option 2: If you want HTML output instead, uncomment this
        // outputContent = toHtml(hast, { allowDangerousHtml: true })
        // outputFile = path.join(outputDir, `${fileName}.html`)

        log.end(`HAST conversion completed in ${perf.timeSince()}`)
      } catch (error: any) {
        console.error(chalk.red(`Failed to convert to HAST: ${error.message}`))
        process.exit(1)
      }
    } else {
      // Default to JSON output (MDAST)
      outputFile = path.join(outputDir, `${fileName}.MDAST.json`)
      outputContent = JSON.stringify(ast, null, 2)
    }

    // Save the output file
    await fs.promises.writeFile(outputFile, outputContent)

    console.log(chalk.green(`Output saved to: ${outputFile}`))
    return outputFile
  } catch (error: any) {
    console.error(chalk.red(`Error processing markdown: ${error.message}`))
    if (argv.verbose) {
      console.error(error)
    }
    process.exit(1)
  }
}

// Default export for dynamic import in handlers.js
export default async (argv: Argv) => {
  try {
    return await convertMarkdown(argv)
  } catch (err: any) {
    console.error(chalk.red(`Error during conversion: ${err.message}`))
    if (argv.verbose) {
      console.error(err)
    }
    process.exit(1)
  }
}
