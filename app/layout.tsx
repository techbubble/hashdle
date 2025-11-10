"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/app/pages/layout/shared/customizer/RTL";
import { ThemeSettings } from "@/app/utils/theme/Theme";
import { store } from "@/app/store/store";
import { useSelector } from "@/app/store/hooks";
import { AppState } from "@/app/store/store";
import { Provider } from "react-redux";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "@/app/api/index";
import "@/app/utils/i18n";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"
import { NextAppDirEmotionCacheProvider } from "@/app/utils/theme/EmotionCache";
import '@rainbow-me/rainbowkit/styles.css';
import { Web3Providers, AutoSwitchNetwork } from '@/app/lib/web3providers';
import { HelmetProvider } from 'react-helmet-async';

export const MyApp = ({ children }: { children: React.ReactNode }) => {
  const theme = ThemeSettings();

  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <>
    
      <NextAppDirEmotionCacheProvider options={{ key: 'modernize' }}>
        <HelmetProvider>

          <ThemeProvider theme={theme}>
            <RTL direction={customizer.activeDir}>
              <CssBaseline />
              <Analytics />
              <SpeedInsights />
              <Web3Providers>
                <AutoSwitchNetwork />
                {children}
              </Web3Providers>
            </RTL>
          </ThemeProvider>
        </HelmetProvider>

      </NextAppDirEmotionCacheProvider>
    </>
  );
};

export default function RootLayout({ children, }: {  children: React.ReactNode; }) {
  return (
    <html lang="en" suppressHydrationWarning style={{overflowX: "hidden"}}>
      <head>
        <title>Hashdle — Crypto Guessing Game</title>
        <meta name="description" content="Guess a five-letter sequence in three tries to win $5." />
        <meta property="og:title" content="Hashdle — Crypto Guessing Game" />
        <meta property="og:description" content="Guess a five-letter sequence in three tries to win $5." />
        <meta property="og:image" content="https://www.hashdle.com/images/preview.png" />
        <meta property="og:url" content="https://https://www.hashdle.com" />
        <meta property="og:type" content="website" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />        
      </head>
      <body style={{overflowX: "hidden"}}>
        <Provider store={store}>
            <MyApp>
              {children}
            </MyApp>
        </Provider>
      </body>
    </html>
  );
}
