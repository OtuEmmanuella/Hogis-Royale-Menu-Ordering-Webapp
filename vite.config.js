import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const generateFirebaseConfig = () => {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
    };

    console.log('Firebase config:', firebaseConfig);

    // Filter out undefined values
    const filteredConfig = Object.fromEntries(
      Object.entries(firebaseConfig).filter(([_, v]) => v != null)
    );

    console.log('Filtered config:', filteredConfig);

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
      host: true,
      port: 3000,
    },
    define: {
      'process.env': env
    },
  };
});