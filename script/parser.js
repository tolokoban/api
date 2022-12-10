const FS = require("fs")
const TypeScriptParser = require("typescript-parser")

if (process.argv.length < 4) {
    console.error(`Usage: node ${process.argv[1]} input.ts output.json`)
    process.exit(1)
}

const [, , inputFilename, outputFilename] = process.argv

const content = FS.readFileSync(inputFilename)
const parser = new TypeScriptParser.TypeScriptParser()
const ast = parser.parseSource(content)
FS.writeFileSync(outputFilename, JSON.stringify(ast, null, "    "))
console.log("Done.")
