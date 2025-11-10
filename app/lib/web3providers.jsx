'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  Theme,
  darkTheme
} from '@rainbow-me/rainbowkit';

import { configureChains, createConfig, WagmiConfig, useNetwork, useSwitchNetwork } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import merge from 'lodash.merge';

import { ContractProvider } from '@/app/lib/ContractContext';
import { bsc } from 'wagmi/chains';

const vitruveo = {
  id: 1490,
  name: 'Vitruveo',
  network: 'vitruveo',
  iconUrl: 'https://irp.cdn-website.com/a01407ef/dms3rep/multi/fav-vit-857c1762.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Vitruveo',
    symbol: 'VTRU',
  },
  rpcUrls: {
    public: { http: ['https://rpc.vitruveo.xyz/'] },
    default: { http: ['https://rpc.vitruveo.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'VitruveoScan', url: 'https://explorer.vitruveo.net' },
  },
  testnet: false,
};

export const customBsc = {
  ...bsc,
  rpcUrls: {
    ...bsc.rpcUrls,
    public: {
      ...bsc.rpcUrls.public,
      http: ['https://bsc-mainnet.nodereal.io/v1/5ef739664b5349c5bfb32d930b3a2215'],
    },
  },
};

const projectId = '7a21b3d51f846061c7b618791d151066';
const appName = 'Hashdle';
const appInfo = {
  appName,
  learnMoreUrl: 'https://www.hashdle.com',
};

const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#02bbbc',
  },
});

export function AutoSwitchNetwork() {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (!switchNetwork) return;

    const targetChainId = 1490;

    if (chain?.id !== targetChainId && chain?.id !== 56) {
      switchNetwork(targetChainId);
    }
  }, [chain?.id,switchNetwork]);

  return null;
}

export function Web3Providers({ children }) {

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedChains = [vitruveo];

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    selectedChains,
    [publicProvider()]
  );

  const { wallets } = getDefaultWallets({
    appName,
    projectId,
    chains,
  });

  const connectors = connectorsForWallets([
    ...wallets,
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider id={projectId} chains={chains} appInfo={appInfo} theme={myTheme}>
        <ContractProvider>
          {mounted && children}
        </ContractProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}