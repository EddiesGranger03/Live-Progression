import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl=(globalThis as any).process?.env?.SOLO_NATIVE_SERVER_URL as string|undefined;
const config: CapacitorConfig = {
  appId: 'com.liveprogression.sololeveling',
  appName: 'Solo Leveling',
  webDir: 'dist',
  ...(serverUrl?{server:{url:serverUrl,cleartext:serverUrl.startsWith('http://'),allowNavigation:[new URL(serverUrl).host]}}:{})
};

export default config;
