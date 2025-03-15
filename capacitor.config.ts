
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1e28c4812dca4181878c04abad26940b',
  appName: 'handwriting-magic-generator',
  webDir: 'dist',
  server: {
    url: 'https://1e28c481-2dca-4181-878c-04abad26940b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    captureInput: true
  }
};

export default config;
