import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import isAbsoluteUrl from "is-absolute-url"
import path from "path"
import fs from "fs"
import { FilePath, FullSlug, RelativeURL, sluggify } from "../../util/path"
import chalk from "chalk"

export interface Options {
    outputDir: string
    copyResources: boolean
    resourcesDir: string
    logLevel: "verbose" | "normal" | "quiet"
}

const defaultOptions: Options = {
    outputDir: "convert-output",
    copyResources: true,
    resourcesDir: "resources",
    logLevel: "normal"
}

export const ConvertResources: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
    const opts = { ...defaultOptions, ...userOpts }

    return {
        name: "ConvertResources",
        markdownPlugins() {
            return [
                () => {
                    return (tree, file) => {
                        // Get the directory of the current file
                        const sourceDir = path.dirname(file.path as string)
                        
                        // Create resources directory if needed
                        const outputResourcesDir = path.join(opts.outputDir, opts.resourcesDir)
                        if (opts.copyResources && !fs.existsSync(outputResourcesDir)) {
                            fs.mkdirSync(outputResourcesDir, { recursive: true })
                        }
                        
                        // Track resources that have been processed to avoid duplicates
                        const processedResources = new Map<string, string>()
                        
                        // Helper to log based on verbosity setting
                        const log = (message: string, level: "info" | "warn" | "error" = "info") => {
                            if (opts.logLevel === "quiet") return
                            if (opts.logLevel === "normal" && level === "info") return
                            
                            const prefix = 
                                level === "error" ? chalk.red("[ConvertResources] ") :
                                level === "warn" ? chalk.yellow("[ConvertResources] ") :
                                chalk.blue("[ConvertResources] ")
                                
                            console.log(prefix + message)
                        }
                        
                        // Helper to sanitize filenames - remove special characters
                        const sanitizeFileName = (fileName: string): string => {
                            // Get file extension
                            const extname = path.extname(fileName)
                            // Get basename without extension
                            const basename = path.basename(fileName, extname)
                            // Sanitize basename - keep only alphanumeric chars, dots, hyphens, and underscores
                            const sanitizedBasename = basename.replace(/[^a-zA-Z0-9._-]/g, '')
                            // Ensure we don't create duplicate filenames by adding a timestamp if needed
                            return `${sanitizedBasename}${extname}`
                        }
                        
                        // Helper to find file on disk by traversing up from source directory
                        const findFile = (url: string): string | null => {
                            // Remove any anchor or query params
                            url = url.split("#")[0].split("?")[0]
                            
                            // Try direct path from the source file's directory
                            let filePath = path.join(sourceDir, url)
                            if (fs.existsSync(filePath)) {
                                return filePath
                            }
                            
                            // Try looking up directories (for cases like ../assets/image.png)
                            let currentDir = sourceDir
                            while (currentDir !== path.parse(currentDir).root) {
                                currentDir = path.dirname(currentDir)
                                filePath = path.join(currentDir, url)
                                if (fs.existsSync(filePath)) {
                                    return filePath
                                }
                            }
                            
                            // Helper function to recursively find the file in directories
                            const findFileRecursively = (dir: string, url: string): string | null => {
                                const entries = fs.readdirSync(dir, { withFileTypes: true })
                                for (const entry of entries) {
                                    const entryPath = path.join(dir, entry.name)
                                    const entryName = sluggify(entry.name)

                                    if (entry.isDirectory()) {
                                        const result = findFileRecursively(entryPath, url)
                                        if (result) {
                                            return result
                                        }
                                    } else if (entry.isFile() && entryName === path.basename(url)) {
                                        return entryPath
                                    }
                                }
                                return null
                            }

                            // Try finding the file in all directories of the file tree
                            const directories = fs.readdirSync(sourceDir, { withFileTypes: true })
                                .filter(dirent => dirent.isDirectory())
                                .map(dirent => path.join(sourceDir, dirent.name))
                            
                            for (const dir of directories) {
                                const result = findFileRecursively(dir, url)
                                if (result) {
                                    return result
                                }
                            }
                            
                            return null
                        }
                        
                        // Nodes with URLs to process
                        visit(tree, ["image"], (node) => {
                            // Process relative URL
                            const originalUrl = node.url
                            
                            // Check if we've already processed this URL
                            if (processedResources.has(originalUrl)) {
                                node.url = processedResources.get(originalUrl)!
                                return
                            }
                            
                            // Find the file on disk
                            const resolvedFilePath = findFile(originalUrl)
                            
                            if (resolvedFilePath) {
                                const originalFileName = path.basename(resolvedFilePath)
                                const fileName = sanitizeFileName(originalFileName)
                                
                                // Copy file to output resources directory if needed
                                if (opts.copyResources) {
                                    try {
                                        fs.copyFileSync(
                                            resolvedFilePath, 
                                            path.join(outputResourcesDir, fileName)
                                        )
                                        log(`Copied resource: ${originalFileName} → ${fileName}`, "info")
                                    } catch (err) {
                                        log(`Failed to copy resource: ${fileName} - ${err}`, "error")
                                    }
                                }
                                
                                // Update the URL to point simply to the file
                                const newUrl = fileName
                                node.url = newUrl
                                processedResources.set(originalUrl, newUrl)
                                
                                log(`Transformed URL: ${originalUrl} → ${newUrl}`, "info")
                            } else {
                                log(`Could not resolve resource: ${originalUrl}`, "warn")
                            }
                        })
                        
                        log(`Processed ${processedResources.size} resources`, "info")
                    }
                },
            ]
        },
    }
}
