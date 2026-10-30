import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed to https://maheshnitrkl.github.io/F348-0339/ via `npm run deploy`,
// so assets must resolve under the repo sub-path. Locally Vite serves at '/',
// the same value import.meta.env.BASE_URL gets during `npm run dev`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/F348-0339/',
})
