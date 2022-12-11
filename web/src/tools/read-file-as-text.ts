export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader: FileReader = new FileReader()
        reader.onload = data => {
            if (!data || !data.target) {
                resolve("")
                return
            }
            const content = data.target.result
            if (typeof content === "string") {
                resolve(content)
            } else {
                resolve("")
            }
        }
        reader.onerror = err => {
            reject(err)
        }
        reader.readAsText(file)
    })
}
