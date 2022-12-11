import { getProjectAndTemplatesRoot } from "./files.js"
import { fatal, print, success } from "./print.js"
import { selectDir, selectTemplate } from "./select.js"
import Template from "./template.js"

const preferredDestinations: Record<string, string> = {}
const { projectRoot, templatesRoot } = getProjectAndTemplatesRoot()
if (projectRoot) print("Project dir", projectRoot)
else fatal("Unable to find a Project in the folder hierarchy!")
if (templatesRoot) print("Templates dir", templatesRoot)
else fatal(`Unable to find a "@template/" folder in the folder hierarchy!`)
console.log()

while (true) {
    const template = selectTemplate(Template.all(templatesRoot))
    if (!template) fatal("Cancelled!")
    console.log()
    print("Using template", template.name)
    const destination = selectDir(
        preferredDestinations[template.name] ?? projectRoot
    )
    if (!destination) continue

    print("Destination", destination)
    preferredDestinations[template.name] = destination
    if (template.copyTo(destination)) {
        success("Done!", "\n")
    }
}
