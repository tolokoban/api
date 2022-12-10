import Parser from "@/parser/parser"
import { useStateEntrypoints } from "@/state"
import { loadText } from "@/tools/load-text"
import PageDocumentation from "@/pages/Documentation"
import PageGenerate from "@/pages/Generate"
import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const BASE_URL = "/api"

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <PageDocumentation />,
        },
        {
            path: "Documentation",
            element: <PageDocumentation />,
        },
        {
            path: "Generate",
            element: <PageGenerate />,
        },
    ],
    {
        basename: window.location.pathname.startsWith(BASE_URL) ? BASE_URL : "",
    }
)

export default function App({ onLoad }: { onLoad: () => void }) {
    const [entrypoints, setEntrypoints] = useStateEntrypoints()
    React.useEffect(() => {
        loadText("./protocol.d.ts")
            .then(content => {
                const parser = new Parser(content)
                setEntrypoints(parser.parse())
                onLoad()
            })
            .catch(console.error)
    }, [])
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}
