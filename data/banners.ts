import { BannerConfig } from '../types';

export const BANNERS: BannerConfig[] = [
  {
    id: 'ios-testflight',
    message: 'Join the beta for our upcoming iOS app!',
    link: 'https://testflight.apple.com/join/Jz6DPS6P',
    linkText: 'Join TestFlight',
    condition: {
      platform: 'ios',
    },
    type: 'info',
  },
];
