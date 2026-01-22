import type { Config } from "tailwindcss"

const config: Config = {
    theme: {
        extend: {
            colors: {
                yellow: "var(--yellow)",
                orange: "var(--orange)",
            },
        },
    },
    plugins: [],
}

export default config
