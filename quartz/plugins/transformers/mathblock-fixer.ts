import { QuartzTransformerPlugin } from "../types"
import fs from "fs"
import path from "path"

export interface Options {
  debug: boolean
}

const defaultOptions: Options = {
  debug: false,
}

export const MathBlockFixer: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  const fixMathBlocks = (content: string): string => {
    const mathBlockPattern = /\$\$.*?\$\$/gs
    const endDollarPattern = /^\s*>\s*\$\$$|^\s*\$\$$/g

    content = content.replace(/(\d+\.)\s?\$\$/g, '$1\n$$')

    const fixBlock = (block: string) => {
      let lines = block.split('\n')
      // Ensure the first line is just '$$'
      if (lines[0].trim() !== '$$') {
        lines[0] = '$$'
        if (lines[1]) {
          lines.splice(1, 0, lines[1].trim().slice(2))
        }
      }
      // Ensure the last line is just '$$'
      const lastLine = lines[lines.length - 1].trim()
      if (lastLine !== '$$') {
        lines[lines.length - 1] = lines[lines.length - 1].trim().slice(0, -2)
        lines.push('$$')
      }
      return lines.join('\n')
    }

    content = content.replace(mathBlockPattern, (match) => fixBlock(match))

    content = content.replace(/    /g, '\t')
    content = content.replace(/ \t/g, '\t')

    let lines = content.split('\n')
    let insideCallout = false
    let insideTabBlock = false
    let insideDoubleTabBlock = false
    let insideTabbedCallout = false
    let insideTabInCallout = false
    let insideDoubleTabBlockInCallout = false

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      // Handle double tabs inside callout
      if (line.startsWith('>\t\t')) {
        insideDoubleTabBlockInCallout = true
      } else if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith('---') || line.trim().startsWith('```')) {
        insideDoubleTabBlockInCallout = false
      }
      if (insideDoubleTabBlockInCallout && !line.startsWith('>\t\t') && !/^\>\t\d+\./.test(line.trim()) && !/^\>\t\- /.test(line.trim())) {
        if (line.trim().startsWith('>\t')) {
          lines[i] = '>\t\t' + line.trim().slice(2)
        } else if (line.trim().startsWith('>')) {
          lines[i] = '>\t\t' + line.trim().slice(1)
        } else {
          lines[i] = '>\t\t' + line
        }
        continue
      }

      // Handle double tabs
      if (line.startsWith('\t\t')) {
        insideDoubleTabBlock = true
      } else if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith('---') || line.trim().startsWith('```')) {
        insideDoubleTabBlock = false
      }
      if (insideDoubleTabBlock && !line.startsWith('\t\t') && !/^\d+\./.test(line.trim()) && !/^\t\- /.test(line.trim())) {
        if (line.startsWith('\t')) {
          lines[i] = '\t' + line
        } else {
          lines[i] = '\t\t' + line
        }
        continue
      }

      // Handle tabbed callouts
      if (/^\t ?\>/.test(line)) {
        insideTabbedCallout = true
      } else if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith('---') || line.trim().startsWith('```')) {
        insideTabbedCallout = false
      }
      if (!insideTabbedCallout && /^\t ?\>/.test(line.trim())) {
        lines[i] = line.trim().slice(1)
      } else if (insideTabbedCallout && !line.startsWith('\t>')) {
        if (line.trim().startsWith('\t')) {
          lines[i] = '>' + line
        } else if (line.trim().startsWith('>')) {
          lines[i] = '\t' + line
        } else {
          lines[i] = '\t>' + line
        }
        continue
      }

      // Handle tabs in callouts
      if (/^\> ?\t/.test(line) || /^\> ?\d+\./.test(line.trim())) {
        insideTabInCallout = true
      } else if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith('---') || line.trim().startsWith('```')) {
        insideTabInCallout = false
      }

      if (insideTabInCallout && /^\> ?\t ?/.test(line)) {
        lines[i] = line.replace(/^\> ?\t ?/, '>\t')
        continue
      }

      if (insideTabInCallout && !/^\> ?\t/.test(line.trim()) && !/^\> ?\t/.test(line) && !/^\> ?\d+\./.test(line.trim()) && !/^\- /.test(line.trim())) {
        if (/^\d+\./.test(line.trim())) {
          lines[i] = '>' + line
        } else if (line.trim().startsWith('>')) {
          lines[i] = '>\t' + line.trim().slice(1)
        } else {
          lines[i] = '>\t' + line
        }
        continue
      }

      // Handle callouts
      if (line.trim().startsWith('>')) {
        insideCallout = true
      } else if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith('---') || line.trim().startsWith('```')) {
        insideCallout = false
      }
      if (insideCallout && !line.trim().startsWith('>')) {
        lines[i] = '> ' + line
        continue
      }

      // Handle tabs
      if (/^\d+\./.test(line.trim()) || /^\- /.test(line.trim())) {
        insideTabBlock = true
      } else if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith('---') || line.trim().startsWith('```')) {
        insideTabBlock = false
      }
      if (!insideTabBlock && /^ ?\t/.test(line)) {
        lines[i] = line.trim().slice(1)
      } else if (insideTabBlock && !/^ ?\t/.test(line) && !/^\d+\./.test(line.trim()) && !/^\- /.test(line.trim())) {
        lines[i] = '\t' + line
        continue
      }
    }

    return lines.join('\n')
  }

  const writeDebugFile = (content: string, filePath: string) => {
    const debugDir = path.resolve('mathblock-debug')
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir)
    }
    const debugFilePath = path.join(debugDir, path.basename(filePath))
    fs.writeFileSync(debugFilePath, content, 'utf-8')
  }

  return {
    name: "MathBlockFixer",
    textTransform(_ctx, src) {
      if (src.includes('[[#סמסטר א’|קפוץ לחומר]].')) {
        return src
      }

      const content = fixMathBlocks(src.toString())
      if (opts.debug) {
        // TODO: Find a way to get the file path, currently generating random file names
        const random = Math.random().toString(36).substring(7)
        const filePath = random + '.md'
        writeDebugFile(content, filePath)
      }
      return content
    },
  }
}