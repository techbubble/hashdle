'use client';

import { createContext, useContext, useEffect, useState, useRef} from 'react';
import { ethers } from 'ethers';
import config from './hashdle-contracts.json';
import { useAccount, useBalance } from 'wagmi';

const usdcAddress = '0xbCfB3FCa16b12C7756CD6C24f1cC0AC0E38569CF';
const usdcAbi = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ContractContext = createContext(null);

export function useContracts() {
  return useContext(ContractContext);
}

export function ContractProvider({ children }) {
  const [usdcInstance, setUsdcInstance] = useState(null);
  const [hashdleInstance, setHashdleInstance] = useState(null);
  const [hashdlePayInstance, setHashdlePayInstance] = useState(null);

  const { address, isConnected } = useAccount(); 
  const { data, isLoading } = useBalance({
    address,
  });
  const [ balance, setBalance ] = useState(0);

  const initialIsConnected = useRef(isConnected);

  useEffect(() => {
    if (!data) return;
    setBalance(Number(data.formatted));
  }, [data]);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider('https://rpc.vitruveo.xyz');

    const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);
    const hashdle = new ethers.Contract(config.mainnet.Hashdle, config.abi.Hashdle, provider);
    const hashdlePay = new ethers.Contract(config.mainnet.HashdlePay, config.abi.HashdlePay, provider);
    

    setUsdcInstance(usdc);
    setHashdleInstance(hashdle);
    setHashdlePayInstance(hashdlePay);

  }, []);

  useEffect(() => {
    if (isConnected !== initialIsConnected.current) {
      window.location.reload();
    }
  }, [isConnected]);

  return (
    <ContractContext.Provider value={{ usdcInstance, hashdleInstance, hashdlePayInstance, address, isConnected, balance }}>
      {children}
    </ContractContext.Provider>
  );
}