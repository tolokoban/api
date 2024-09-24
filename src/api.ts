#!/usr/bin/env node

import FS from "node:fs"
import Path from "node:path"
import Chalk from "chalk"

import Parser from "./parser/index.js"
import { parseArgs } from "./args.js"
import { generateDoc } from "./generate/doc.js"
import { generateServer } from "./generate/server/server.js"
import { generateClient } from "./generate/client.js"
import Package from "../package.json"
import { printError } from "./print.js"

function start() {
    const time = Date.now()
    const {
        docPath,
        clientPath,
        serverPath,
        serverScaffolder,
        protocol,
        serverType,
    } = parseArgs()
    if (!FS.existsSync(protocol)) {
        printError(`Protocol file does not exist: ${protocol}`)
        process.exit(1)
    }
    const root = Path.dirname(protocol)
    const content = FS.readFileSync(protocol).toString()
    try {
        const parser = new Parser(content)
        const definition = parser.parse()
        generateDoc(docPath && Path.resolve(root, docPath), definition)
        generateClient(clientPath && Path.resolve(root, clientPath), definition)
        generateServer(
            serverPath && Path.resolve(root, serverPath),
            definition,
            serverScaffolder,
            serverType
        )
        console.log(
            "API code gnenerated in",
            Chalk.whiteBright.bold(
                `${(0.001 * (Date.now() - time)).toFixed(2)}`
            ),
            "seconds."
        )
    } catch (ex) {
        console.error(Chalk.redBright(ex))
    }
}

const title = ` @tolokoban/api v${Package.version} `
const sep = `+${"-".repeat(title.length)}+`
console.log(sep)
console.log(`|${title}|`)
console.log(sep)

start()
