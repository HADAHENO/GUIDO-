import { CapacitorConfig } from '@capacitor/cli';

interface ExtendedCapacitorConfig extends CapacitorConfig {
    version?: string;
}

const config: ExtendedCapacitorConfig = {
    appId: 'com.example.myapp',
    appName: 'MyApp',
    webDir: 'dist/',
    version: '1.0.1', // Now valid
    server: {
        url: 'https://guido-three.vercel.app',
        cleartext: true
    }
};

export default config;