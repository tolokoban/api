export async function loadText(url: string): Promise<string> {
    const response = await fetch(url)
    return response.text()
}
