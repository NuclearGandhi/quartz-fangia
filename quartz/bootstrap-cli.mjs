#!/usr/bin/env node
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import {
  handleBuild,
  handleCreate,
  handleUpdate,
  handleRestore,
  handleSync,
  handleConvert,
} from "./cli/handlers.js"
import { CommonArgv, BuildArgv, CreateArgv, SyncArgv, ConvertArgv } from "./cli/args.js"
import { version } from "./cli/constants.js"

yargs(hideBin(process.argv))
  .scriptName("quartz")
  .version(version)
  .usage("$0 <cmd> [args]")
  .command("create", "Initialize Quartz", CreateArgv, async (argv) => {
    await handleCreate(argv)
  })
  .command("update", "Get the latest Quartz updates", CommonArgv, async (argv) => {
    await handleUpdate(argv)
  })
  .command(
    "restore",
    "Try to restore your content folder from the cache",
    CommonArgv,
    async (argv) => {
      await handleRestore(argv)
    },
  )
  .command("sync", "Sync your Quartz to and from GitHub.", SyncArgv, async (argv) => {
    await handleSync(argv)
  })
  .command("build", "Build Quartz into a bundle of static HTML files", BuildArgv, async (argv) => {
    await handleBuild(argv)
  })
  .command("convert", "Convert a markdown file to MDAST or LaTeX", ConvertArgv, async (argv) => {
    await handleConvert(argv)
  })
  .showHelpOnFail(false)
  .help()
  .strict()
  .demandCommand().argv
