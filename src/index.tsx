import * as React from "react"
import { createRoot } from "react-dom/client"
import App from "./view/app"
import "./index.css"
import Theme from "./ui/theme"

function start() {
    const theme = new Theme({
        colors: {
            neutral: { hue: 330, chroma: [5, 0], lightness: [70, 100] },
            primary: {
                hue: [280, 310],
                chroma: [25, 10],
                lightness: [35, 100],
            },
            secondary: {
                hue: [300, 300],
                chroma: [80, 100],
                lightness: [55, 85],
            },
            tertiary: {
                hue: [100, 100],
                chroma: [100, 120],
                lightness: [50, 120],
            },
        },
    })
    theme.apply()
    const container = document.getElementById("app")
    if (!container) throw Error(`No element with id "app"!`)

    const root = createRoot(container)
    root.render(<App onLoad={removeSplash} />)
}

function removeSplash() {
    const duration = 50
    const logo = document.getElementById("splash-screen")
    if (!logo) return
    const parent = logo.parentNode
    if (!parent) return
    logo.style.transition = `opacity ${duration}ms`
    setTimeout(() => {
        logo.classList.add("hide")
        setTimeout(() => {
            try {
                parent.removeChild(logo)
            } catch (ex) {
                /* Exception ignored */
            }
        }, duration)
    })
}

start()
