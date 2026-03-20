import { BannerConfig } from '../types';
import { DISCORD_INVITE_URL, TESTFLIGHT_URL, APP_STORE_URL } from '../constants';

export const BANNERS: BannerConfig[] = [
  {
    id: 'ios-app-store-release',
    message: 'Our iOS app is officially live on the App Store!',
    link: APP_STORE_URL,
    linkText: 'Download Now',
    secondaryLink: DISCORD_INVITE_URL,
    secondaryLinkText: 'Join Discord',
    condition: {
      platform: 'ios',
    },
    type: 'info',
  },
  {
    id: 'ios-testflight',
    message: 'Join the beta for our upcoming iOS app!',
    link: TESTFLIGHT_URL,
    linkText: 'Join TestFlight',
    secondaryLink: DISCORD_INVITE_URL,
    secondaryLinkText: 'Join Discord',
    enabled: false,
    condition: {
      platform: 'ios',
    },
    type: 'info',
  },
];
