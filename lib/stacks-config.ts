import { UserSession, AppConfig } from '@stacks/auth';

const appConfig = new AppConfig(
  ['store_write', 'publish_data'],
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
);

export const userSession = new UserSession({ appConfig });

// Network configuration
export const STACKS_NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'mainnet';
export const IS_TESTNET = STACKS_NETWORK === 'testnet';