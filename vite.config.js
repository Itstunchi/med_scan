// import path from 'path'
// import { defineConfig } from 'vite'
// import react, { reactCompilerPreset } from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     babel({ presets: [reactCompilerPreset()] })
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
