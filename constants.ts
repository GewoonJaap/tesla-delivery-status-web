export const CLIENT_ID = 'ownerapi';
export const REDIRECT_URI = 'https://auth.tesla.com/void/callback';
export const AUTH_URL = 'https://auth.tesla.com/oauth2/v3/authorize';
export const TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';
export const SCOPE = 'openid email offline_access';
export const CODE_CHALLENGE_METHOD = 'S256';
export const APP_VERSION = '9.99.9-9999';
export const ORDERS_API_URL = 'https://owner-api.teslamotors.com/api/1/users/orders';
export const ORDER_DETAILS_API_URL_TEMPLATE = 'https://akamai-apigateway-vfx.tesla.com/tasks?deviceLanguage=en&deviceCountry=US&referenceNumber={ORDER_ID}&appVersion=' + APP_VERSION;
export const PROXY_API_URL = 'https://tesla-delivery-277250840124.europe-west1.run.app/';
export const GITHUB_REPO_URL = 'https://github.com/GewoonJaap/tesla-delivery-status-web';
export const DISCORD_INVITE_URL = 'https://discord.gg/jJyngRwqzt';
export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/Jz6DPS6P';

export const COMPOSITOR_BASE_URL = 'https://static-assets.tesla.com/configurator/compositor';

export const MAX_HISTORY_ENTRIES = 20;

export const FALLBACK_CAR_IMAGE_URLS: Record<string, string> = {
  'S': 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Model-S.png',
  '3': 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Model-3-Performance-LHD.png',
  'X': 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Model-X.png',
  'Y': 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Model-Y-2-v2.png',
  'CYBERTRUCK': 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Cybertruck-1x.png',
};

export const DELIVERY_CHECKLIST = [
  {
    title: "Pre-Delivery Tasks",
    items: [
      { id: 'payment', text: 'Finalize payment or financing' },
      { id: 'insurance', text: 'Arrange vehicle insurance' },
      { id: 'documents', text: 'Review all final documents in your account' },
      { id: 'charging', text: 'Install or prepare home charging solution' },
      { id: 'trade-in', text: 'Prepare your trade-in vehicle (if applicable)' },
    ]
  },
  {
    title: "Delivery Day Inspection",
    items: [
      { id: 'exterior', text: 'Inspect exterior for paint defects or panel gaps' },
      { id: 'interior', text: 'Inspect interior for scuffs, stains, or damage' },
      { id: 'wheels', text: 'Check wheels and tires for scrapes or damage' },
      { id: 'glass', text: 'Inspect all glass for chips or cracks' },
      { id: 'accessories', text: 'Verify all accessories are present (charging cables, mats, etc.)' },
      { id: 'software', text: 'Check infotainment screen and basic software functions' },
      { id: 'charging_test', text: 'Confirm vehicle is charging correctly with provided cable' },
    ]
  }
];

export const DIFF_KEY_LABELS: Record<string, string> = {
  'order.orderStatus': 'Order Status',
  'order.vin': 'VIN',
  'details.tasks.deliveryDetails.regData.reggieLicensePlate': 'License Plate',
  'order.mktOptions': 'Vehicle Options',
  'order.ownerCompanyName': 'Company Name',
  'details.tasks.scheduling.deliveryWindowDisplay': 'Delivery Window',
  'details.tasks.scheduling.apptDateTimeAddressStr': 'Delivery Appointment',
  'details.tasks.finalPayment.data.etaToDeliveryCenter': 'ETA to Delivery Center',
  'details.tasks.registration.orderDetails.vehicleRoutingLocation': 'Vehicle Location',
  'details.tasks.scheduling.deliveryType': 'Delivery Method',
  'details.tasks.scheduling.deliveryAddressTitle': 'Delivery Center',
  'details.tasks.registration.orderDetails.vehicleOdometer': 'Odometer',
  'details.tasks.registration.orderDetails.reservationDate': 'Reservation Date',
  'details.tasks.registration.orderDetails.orderBookedDate': 'Order Booked Date',
};