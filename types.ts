
export interface TeslaTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface TeslaOrder {
  referenceNumber: string;
  orderStatus: string;
  modelCode: string;
  vin?: string;
  isB2b?: boolean;
  ownerCompanyName?: string;
  isUsed?: boolean;
  mktOptions?: string;
}

export interface TeslaTaskCard {
  title: string;
  subtitle: string;
  messageBody?: string;
  messageTitle?: string;
  buttonText?: { cta: string };
  target?: string;
}

export interface TeslaTask {
  id: string;
  complete: boolean;
  enabled: boolean;
  required: boolean;
  order: number;
  card?: TeslaTaskCard;
  [key: string]: any; // for other properties
}

export interface OrderDetails {
  tasks: {
    [key: string]: TeslaTask | any; // Allows for other keys like 'state' and 'strings'
  };
}

export interface CombinedOrder {
  order: TeslaOrder;
  details: OrderDetails;
}

export type OrderDiff = {
  [key: string]: { old: any; new: any };
};

export interface HistoricalSnapshot {
  timestamp: number;
  data: CombinedOrder;
}

export interface BannerConfig {
  id: string;
  message: string;
  link?: string;
  linkText?: string;
  secondaryLink?: string;
  secondaryLinkText?: string;
  condition?: {
    platform?: 'ios' | 'android' | 'all';
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
  };
  type?: 'info' | 'warning' | 'success' | 'error';
}
