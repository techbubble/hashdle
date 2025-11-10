'use client'

import { useMemo, useEffect, useState, useRef, memo  } from 'react';
import MainLayout from '@/app/pages/components/MainLayout';
import PageContainer from '@/app/pages/components/container/PageContainer';
import {
  Typography,
  Box,
  CardContent,
  Grid,
  Button,
  Slider
} from '@mui/material';
import { useContracts } from '@/app/lib/ContractContext';
import { readContract, writeContract, waitForTransaction } from '@wagmi/core';
import { ToastContainer, toast } from 'react-toastify';
import { parseUnits } from 'ethers';

const Credits = () => {

  const pageName = 'Credits';
  const TOKEN_KEY = 'usdc.pol';
  const BASIS_POINTS = 10000;
  const USDC_DECIMALS = 6;
  const { usdcInstance, hashdlePayInstance, address, isConnected, balance } = useContracts();
  const [credits, setCredits] = useState(0n);
  const [usdcBalance, setUsdcBalance] = useState(0n);
  const [depositAmount, setDepositAmount] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  
  // Local state for slider during drag - prevents page re-renders
  const [depositDrag, setDepositDrag] = useState(1);
  const [withdrawDrag, setWithdrawDrag] = useState(0);

  let processing = false;

  // Slider styling with dark grey-blue track
  const sliderStyle = {
    '& .MuiSlider-thumb': {
      backgroundColor: '#ffffff',
      border: '3px solid #02bbbb',
      width: 24,
      height: 24,
    },
    '& .MuiSlider-track': {
      backgroundColor: '#34495e',  // Dark grey-blue
      height: 8,
    },
    '& .MuiSlider-rail': {
      backgroundColor: '#555555',
      height: 8,
    },
    '& .MuiSlider-mark': {
      backgroundColor: '#096F6F',
      height: 12,
      width: 2,
    },
    '& .MuiSlider-markLabel': {
      color: '#ffffff',
      fontWeight: 600,
    },
    '& .MuiSlider-valueLabel': {
      backgroundColor: '#096F6F',
      color: '#ffffff',
      fontWeight: 700,
    },
  };


  const hydrate = async() => {
        const storageKey = `gas_sent_${address}`;
        const alreadySent = localStorage.getItem(storageKey);
        
        if (!alreadySent) {
          try {
            localStorage.setItem(storageKey, 'true');
            
            const response = await fetch('/api/hydrate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY
              },
              body: JSON.stringify({ address })
            });
            
            if (!response.ok) {
              localStorage.removeItem(storageKey);
              console.error('Failed to hydrate account');
            }
          } catch (error) {
            localStorage.removeItem(storageKey);
            console.error('Error hydrating account:', error);
          }
        }
  }

  const updateCredits = async() => {
    setCredits(await hashdlePayInstance.viewCreditsBps(TOKEN_KEY, address));
  }

  const updateUsdcBalance = async() => {
    try {
      const balance = await usdcInstance.balanceOf(address);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      setUsdcBalance(0n);
    }
  }

  const formatUsdcBalance = (balance) => {
    return (Number(balance) / (10 ** USDC_DECIMALS)).toFixed(2);
  }

  const getMaxDeposit = () => {
    const usdcAmount = Number(usdcBalance) / (10 ** USDC_DECIMALS);
    return Math.floor(usdcAmount)
  }

  const getMaxWithdraw = () => {
    return Number(credits) / BASIS_POINTS;
  }

  const hasMinimumUsdc = () => {
    const usdcAmount = Number(usdcBalance) / (10 ** USDC_DECIMALS);
    return usdcAmount >= 1;
  }

  const showError = (err) => {
    const message = err?.message || '';
    const match = message.match(/reason:\s*(.*?)(\n|$)/i);
    const reason = match ? match[1].trim() : 'Transaction failed';
  
    toast.error(reason, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    console.log(err);
    processing = false;
  }
  

  const handleBridge = () => {
    window.open('https://vitruveo.protousd.com', '_blank', 'noopener,noreferrer');
  }

  const handleDeposit = async () => {
    if (processing) return;
    processing = true;      
    const hashdlePayAbi = JSON.parse(hashdlePayInstance.interface.formatJson());
    const usdcAbi = JSON.parse(usdcInstance.interface.formatJson());

    try {

          // Check current allowance
        const currentAllowance = await readContract({
            address: usdcInstance.target,
            abi: usdcAbi,
            functionName: "allowance",
            args: [address, hashdlePayInstance.target], // address is the user's wallet address
        });

        // Only approve if current allowance is less than deposit amount
        if (currentAllowance < depositAmount) {
            const approveAmount = parseUnits("100", 6); // 100 USDC (6 decimals)
            
            const { hash: hash1 } = await writeContract({
                address: usdcInstance.target,
                abi: usdcAbi,
                functionName: "approve",
                args: [hashdlePayInstance.target, approveAmount],
                mode: 'recklesslyUnprepared',               
            });
            await waitForTransaction({ hash: hash1 });
        }

        const { hash } = await writeContract({
            address: hashdlePayInstance.target,
            abi: hashdlePayAbi,
            functionName: "depositCredits",
            args: [TOKEN_KEY, depositAmount],
            mode: 'recklesslyUnprepared',               
        });
        await waitForTransaction({ hash });
        window.location.reload();
      }
      catch(err) {
        showError(err);
      }
  }

  const handleWithdraw = async () => {
    if (processing) return;
    processing = true;      
    const hashdlePayAbi = JSON.parse(hashdlePayInstance.interface.formatJson());

    try {
        const { hash } = await writeContract({
            address: hashdlePayInstance.target,
            abi: hashdlePayAbi,
            functionName: "withdrawCredits",
            args: [TOKEN_KEY, withdrawAmount * BASIS_POINTS],
            mode: 'recklesslyUnprepared',               
        });
        await waitForTransaction({ hash });
        window.location.reload();
      }
    catch(err) {
        showError(err);
    }
  }

  useEffect(() => {
    async function showConnectedContent() {
      if (address?.length === 42) {
        await hydrate();
        await updateCredits();
        await updateUsdcBalance();
      }
    }
    showConnectedContent();
  }, [address]);

  return (
    <MainLayout>
      <ToastContainer />
      <PageContainer title={pageName} description="Manage Credits">


        {
          address?.length == 42 ?
        <Grid container spacing={3} sx={{p: "30px 5px 0 30px"}}>

          <Grid container spacing={3} style={{ marginBottom: "20px" }}>

                <Grid item xs={12} sm={4} md={4} lg={4} key={1}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '10px'}}
                      >
                        Credits Balance
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                            {(Number(credits)/BASIS_POINTS).toFixed(2)}                       
                      </Typography>                            
                    </CardContent>
                  </Box>
                </Grid>


                <Grid item xs={12} sm={4} md={4} lg={4} key={2}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '10px'}}
                      >
                        USDC.pol Balance
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                        {formatUsdcBalance(usdcBalance)}
                      </Typography>
                    </CardContent>
                  </Box>
                </Grid>


                <Grid item xs={12} sm={4} md={4} lg={4} key={3}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '10px'}}
                      >
                        Bridge USDC
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                        <Button 
                          variant="contained"
                          onClick={handleBridge}
                          sx={{fontSize: '16px', fontWeight: 'bold', color: 'white'}}
                        >
                          Bridge
                        </Button>
                      </Typography>
                    </CardContent>
                  </Box>
                </Grid>

          </Grid>

          <Grid container spacing={3} style={{ marginBottom: "20px" }}>

                <Grid item xs={12} sm={6} md={6} lg={6} key={4}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '260px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography
                      color={"#096F6F"}
                      variant="h5"
                      fontWeight={600}
                      style={{marginBottom: '20px'}}
                    >
                      Deposit USDC.pol → Credits
                    </Typography>
                    
                    {hasMinimumUsdc() ? (
                      <>
                        <Typography color={"#096F6F"} variant="h4" fontWeight={700} style={{marginBottom: '10px'}}>
                          {depositDrag} USDC.pol
                        </Typography>

                        <Box sx={{ px: 3, mb: 3 }}>
                          <Slider
                            value={depositDrag}
                            onChange={(e, newValue) => setDepositDrag(newValue)}
                            onChangeCommitted={(e, newValue) => setDepositAmount(newValue)}
                            min={0}
                            max={getMaxDeposit()}
                            step={1}
                            marks={[
                              { value: 0, label: '0' },
                              { value: getMaxDeposit(), label: getMaxDeposit().toString() }
                            ]}
                            valueLabelDisplay="on"
                            valueLabelFormat={(value) => `${value}`}
                            disabled={getMaxDeposit() === 0}
                            sx={sliderStyle}
                          />
                        </Box>

                        <Button 
                          variant="contained"
                          onClick={handleDeposit}
                          disabled={depositAmount === 0 || getMaxDeposit() === 0}
                          sx={{fontSize: '16px', fontWeight: 'bold', color: 'white', '&.Mui-disabled': { color: 'white !important' }}}
                        >
                          Deposit {depositAmount} USDC.pol
                        </Button>

                        <Typography color={"#096F6F"} variant="caption" style={{display: 'block', marginTop: '10px'}}>
                          Converts 1:1 to Credits (no fees)
                        </Typography>
                      </>
                    ) : (
                      <Typography color={"#096F6F"} variant="h6">
                        Deposits require a balance of at least 1 USDC.pol
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={6} lg={6} key={5}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '260px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography
                      color={"#096F6F"}
                      variant="h5"
                      fontWeight={600}
                      style={{marginBottom: '20px'}}
                    >
                      Withdraw Credits → USDC.pol
                    </Typography>
                    
                    {getMaxWithdraw() > 0 ? (
                      <>
                        <Typography color={"#096F6F"} variant="h4" fontWeight={700} style={{marginBottom: '10px'}}>
                          {withdrawDrag.toFixed(2)} Credits
                        </Typography>

                        <Box sx={{ px: 3, mb: 3 }}>
                          <Slider
                            value={withdrawDrag}
                            onChange={(e, newValue) => setWithdrawDrag(newValue)}
                            onChangeCommitted={(e, newValue) => setWithdrawAmount(newValue)}
                            min={0}
                            max={getMaxWithdraw()}
                            step={0.01}
                            marks={[
                              { value: 0, label: '0' },
                              { value: getMaxWithdraw(), label: getMaxWithdraw().toFixed(2) }
                            ]}
                            valueLabelDisplay="on"
                            valueLabelFormat={(value) => `${value.toFixed(2)}`}
                            disabled={getMaxWithdraw() === 0}
                            sx={sliderStyle}
                          />
                        </Box>

                        <Button 
                          variant="contained"
                          onClick={handleWithdraw}
                          disabled={withdrawAmount === 0 || getMaxWithdraw() === 0}
                          sx={{fontSize: '16px', fontWeight: 'bold', color: 'white', '&.Mui-disabled': { color: 'white !important' }}}
                        >
                          Withdraw {withdrawAmount.toFixed(2)} Credits
                        </Button>

                        <Typography color={"#096F6F"} variant="caption" style={{display: 'block', marginTop: '10px'}}>
                          Converts 1:1 to USDC.pol (no fees)
                        </Typography>
                      </>
                    ) : (
                      <Typography color={"#096F6F"} variant="h6">
                        No Credits available to withdraw.
                      </Typography>
                    )}
                  </Box>
                </Grid>

          </Grid>


        </Grid>
          
        :
        
        <h1>Connect your wallet to manage Credits</h1>

      }

      <h4 style={{width: '100%', textAlign: 'center'}}>All actions are final, irreversible, and non-refundable.  <a href="mailto:hashdlegame@gmail.com" style={{color: '#ffffff', textDecoration: 'underline'}}>Contact</a></h4>

      </PageContainer> 
    </MainLayout>
  );
};

export default Credits;