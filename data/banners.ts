import { BannerConfig } from '../types';
import { DISCORD_INVITE_URL, TESTFLIGHT_URL } from '../constants';

export const BANNERS: BannerConfig[] = [
  {
    id: 'ios-testflight',
    message: 'Join the beta for our upcoming iOS app!',
    link: TESTFLIGHT_URL,
    linkText: 'Join TestFlight',
    secondaryLink: DISCORD_INVITE_URL,
    secondaryLinkText: 'Join Discord',
    condition: {
      platform: 'ios',
    },
    type: 'info',
  },
];
