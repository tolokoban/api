import FS from "fs"
import Chalk from "chalk"
import Parser from "./parser/index.js"
import { parseArgs } from "./args.js"
import { generateDoc } from "./generate/doc.js"
import { generateServer } from "./generate/server.js"
import { generateClient } from "./generate/client.js"

function start() {
    const { inputPath, docPath, clientPath, serverPath } = parseArgs()
    if (!inputPath) return

    const content = FS.readFileSync(inputPath).toString()
    try {
        const parser = new Parser(content)
        const protocol = parser.parse()
        console.log(JSON.stringify(protocol, null, "  "))
        generateDoc(docPath, protocol)
        generateClient(clientPath, protocol)
        generateServer(serverPath, protocol)
    } catch (ex) {
        console.error(Chalk.redBright(ex))
    }
}

start()
