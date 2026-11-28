import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cafebara.ordering',
  appName: 'Cafebara',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
};

export default config;
