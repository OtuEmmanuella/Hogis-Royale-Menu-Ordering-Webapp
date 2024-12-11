import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd(), '');

  // Generate Firebase config dynamically
  const generateFirebaseConfig = () => {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    console.log('Firebase config:', firebaseConfig);

    // Filter out null or undefined values
    const filteredConfig = Object.fromEntries(
      Object.entries(firebaseConfig).filter(([_, v]) => v != null)
    );

    console.log('Filtered config:', filteredConfig);

    // Write the config to a file in the `public` directory
    const configContent = `const firebaseConfig = ${JSON.stringify(filteredConfig, null, 2)};`;
    writeFileSync('public/firebase-config.js', configContent);
  };

  return {
    plugins: [
      react(),
      {
        name: 'generate-firebase-config',
        buildStart() {
          generateFirebaseConfig();
        },
      },
    ],
    server: {
      host: true, // Allows accessing the dev server from the local network
      port: 5173,
      strictPort: false, // Falls back to another port if 5173 is unavailable
      hmr: {
        overlay: true, // Displays errors as overlays in the browser
      },
      proxy: {
        '/.netlify/functions': {
          target: 'http://localhost:8888',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/.netlify\/functions/, ''),
        },
      }
    },
    define: {
      'process.env': JSON.stringify(env), // Provides environment variables to the client-side
    },
    build: {
      outDir: 'dist', // Directory for production build
      assetsDir: 'assets', // Directory for static assets within the build folder
      emptyOutDir: true, // Clears the output directory before building
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'], // Splits vendor dependencies into a separate chunk
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // Ensures these dependencies are optimized
    },
  };
});
