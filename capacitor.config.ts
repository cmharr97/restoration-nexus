import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8da0ca9f3f5347ed8e511b466a11a9e8',
  appName: 'restoration-nexus',
  webDir: 'dist',
  server: {
    url: 'https://8da0ca9f-3f53-47ed-8e51-1b466a11a9e8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    }
  }
};

export default config;
