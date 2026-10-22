// vite.config.js  (bloque test, ampliado)
test: {
    globals: true,
        environment: 'jsdom',
            setupFiles: ['./src/test/setup.js'],
                css: false,
                    restoreMocks: true,
                        clearMocks: true,
                            env: {
        VITE_API_URL: 'http://localhost:8000/api',
  },
    // ...
}