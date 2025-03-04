#!/usr/bin/env node
import workerpool from "workerpool"

// The worker script is transpiled by esbuild to .quartz-cache/transpiled-worker.mjs
import { parseMarkdown, processHtml } from "./.quartz-cache/transpiled-worker.mjs"

// Expose the methods to the worker pool
workerpool.worker({
  parseMarkdown,
  processHtml
})
