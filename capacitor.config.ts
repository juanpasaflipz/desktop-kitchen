import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.juanbertos.pos',
  appName: 'Juanbertos POS',
  webDir: 'dist',
  server: {
    // Load web assets from the production server so /api calls resolve correctly
    url: 'https://pos.juanbertos.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
};

export default config;
