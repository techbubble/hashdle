'use client'

import { useMemo, useEffect, useState, useRef  } from 'react';
import { useParams, useRouter } from 'next/navigation';

import MainLayout from '@/app/pages/components/MainLayout';
import PageContainer from '@/app/pages/components/container/PageContainer';

import "./global.css";
import {
  Typography,
  Box,
  CardContent,
  Grid,
  Button
} from '@mui/material';

import format from '@/app/lib/format';
import { useContracts } from '@/app/lib/ContractContext';
import { writeContract, waitForTransaction } from '@wagmi/core';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';

export default function Play() {


  const pageName = 'Play';
  const TOKEN_KEY = 'usdc.pol';
  const BASIS_POINTS = 10000;
  const TEXT_GAMEHASH = 'NO ACTIVE GAME';
  const { hashdleInstance, hashdlePayInstance, address, isConnected, balance } = useContracts();
  const [game, setGame] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [gettingCredits, setGettingCredits] = useState(false);
  const [credits, setCredits] = useState(0n);
  const [expired, setExpired] = useState(false);
  const [clockInterval, setClockInterval] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  let processing = false;


  const hydrate = async() => {
        // Check browser storage
        const storageKey = `gas_sent_${address}`;
        const alreadySent = localStorage.getItem(storageKey);
        
        if (!alreadySent) {
          try {
            // Mark as sent in storage first (to prevent duplicate calls)
            localStorage.setItem(storageKey, 'true');
            
            // Call hydrate API
            const response = await fetch('/api/hydrate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY
              },
              body: JSON.stringify({ address })
            });
            
            if (!response.ok) {
              // If API call fails, remove the storage flag
              localStorage.removeItem(storageKey);
              console.error('Failed to hydrate account');
            }
          } catch (error) {
            // If API call fails, remove the storage flag
            localStorage.removeItem(storageKey);
            console.error('Error hydrating account:', error);
          }
        }
  }

  const updateCredits = async() => {
    setCredits(await hashdlePayInstance.viewCreditsBps(TOKEN_KEY, address));
  }

  const updateGameState = async() => {
      const result = await hashdleInstance.viewGameFor(TOKEN_KEY, address);
      let tmpGame = result.toObject(true);
      setGame(tmpGame);
      await updateCredits();
      
      if (tmpGame.g.status != 1) {
        stopClock();
        return;
      }

      // Only start clock if there's an active game
      setExpired(false); // Reset expired state for new game
      if (tmpGame.gameId > 0) {
        startClock(tmpGame.g.endTime, setExpired);
      }
  }

  useEffect(() => {
    async function showConnectedContent() {
      if (address?.length === 42) {
        await hydrate();
        await updateGameState();
      }
    }
    showConnectedContent();
  }, [address]);

  useEffect(() => {
    stopClock();
  }, [game]);
    
  const start = async () => {
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY
        },
        body: JSON.stringify({
          address,            // must exist in this scope
          tokenKey: "usdc.pol",
          chain: "mainnet",
        }),
      });

      const data = await res.json();
      setAccessToken(data.accessToken); 
      if (!res.ok) throw new Error(data?.error || "Start failed");
    } catch (err) {
      console.error("start error:", err);
      alert(err.message || "Error");
    }
  };


 const stopClock = () => {
    // Clear any existing interval first
    if (clockInterval) {
      clearInterval(clockInterval);
    }

    const element = document.getElementById('timeRemaining');
    if (!element) return;

    element.innerHTML = '0:00';
    setExpired(true);
 }

 const startClock = (endTime, setExpired) => {
    // Clear any existing interval first
    if (clockInterval) {
      clearInterval(clockInterval);
    }
    
    const updateClock = () => {
      const element = document.getElementById('timeRemaining');
      if (!element) return false;
      
      const now = BigInt(Math.floor(Date.now() / 1000));
      const remaining = endTime - now;

      if (remaining <= 0n) {
        element.innerHTML = '0:00';
        setExpired(true);
        return false;
      }
      
      const minutes = Number(remaining / 60n);
      const seconds = Number(remaining % 60n);
      
      element.innerHTML = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      return true;
    };
    
    // Update immediately
    if (!updateClock()) return;
    
    // Then update every second
    const intervalId = setInterval(() => {
      if (!updateClock()) {
        clearInterval(intervalId);
        setClockInterval(null);
      }
    }, 1000);
    
    setClockInterval(intervalId);
  }

  const submitHandler = async (guessValueRaw) => {
    if (processing) return;
      processing = true;
      
      try {

        if (!game.gameId) throw new Error("No active game started");
        const guessValue = String(guessValueRaw || "").trim().toUpperCase();
    
        if (!/^[0-9A-F]{5}$/.test(guessValue)) {
          throw new Error("Guess must be exactly 5 uppercase hex characters (0–9, A–F)");
        }
        const res = await fetch("/api/guess", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY            
          },
          body: JSON.stringify({
            tokenKey: "usdc.pol",
            chain: "mainnet",
            gameId: Number(game.gameId), 
            guessValue,
            accessToken
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Guess failed");
        await updateGameState();
        processing = false;
      }
      catch(err) {
        showError(err);
    }
  };

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

  const startHandler = async () => {
      if (processing) return;
      processing = true;
      //setBtnText('Wait...processing');
      
      const hashdleAbi = JSON.parse(hashdleInstance.interface.formatJson());
      const allowed = await hashdleInstance.canCreateGame(TOKEN_KEY, address);
      try {
          if (allowed === true) {
            const { hash } = await writeContract({
                address: hashdleInstance.target,
                abi: hashdleAbi,
                functionName: "createGame",
                args: [TOKEN_KEY, 0],
                mode: 'recklesslyUnprepared',               
            });
            await waitForTransaction({ hash });

            await start();
            await updateGameState();
            processing = false;
          } else {
            toast.error('Unable to start game (insufficient user or game credits, or game already started)', {
              position: 'top-right',
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });            
            processing = false;
          }
        }
      catch(err) {
        showError(err);
    }
  }

  const settleHandler = async () => {
      if (processing) return;
      processing = true;      
      const hashdleAbi = JSON.parse(hashdleInstance.interface.formatJson());

      try {
            const { hash } = await writeContract({
                address: hashdleInstance.target,
                abi: hashdleAbi,
                functionName: "settleGame",
                args: [TOKEN_KEY],
                mode: 'recklesslyUnprepared',               
            });
            await waitForTransaction({ hash });
            await updateGameState();
            processing = false;
        }
      catch(err) {
        showError(err);
    }
  }

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startHandler();
    } finally {
      setIsStarting(false);
    }
  };

  const handleSettle = async () => {
    setIsStarting(true);
    try {
      await settleHandler();
    } finally {
      setIsStarting(false);
    }
  };

  const Guess = ({ guess, colors }) => {
    const getBackgroundColor = (colorCode) => {
      if (Number(colorCode) === 0) return '#ffffff';
      if (Number(colorCode) === 1) return '#ff9800';
      if (Number(colorCode) === 2) return '#4caf50';
      return '#e0e0e0';
    };
    
    const isEmpty = !guess || guess === '';
    const characters = isEmpty ? ['', '', '', '', ''] : guess.split('');
    
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        {characters.map((char, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '4px solid black',
              borderBottom: '4px solid black',
              borderLeft: index === 0 ? '4px solid black' : 'none',
              borderRight: '4px solid black',
              fontWeight: 'bold',
              fontSize: '24px',
              padding: '5px',
              color: 'black',
              backgroundColor: isEmpty ? '#e0e0e0' : getBackgroundColor(colors[index])
            }}
          >
            {char}
          </div>
        ))}
      </div>
    );
  }

  const GuessInput = ({ submitHandler }) => {
    const [inputValue, setInputValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentGuess, setCurrentGuess] = useState('');
    const inputRef = useRef(null);

    // Sync with parent's currentGuess
    useEffect(() => {
      if (currentGuess !== inputValue) {
        setInputValue(currentGuess);
      }
    }, [currentGuess]);

    const handleTileClick = () => {
      inputRef.current?.focus();
    };

    const handleChange = (e) => {
      const value = e.target.value.toUpperCase();
      // Only allow A-F and 0-9, max 5 characters
      const filtered = value.replace(/[^A-F0-9]/g, '').slice(0, 5);
      setInputValue(filtered);
      
      // Only update currentGuess when we have exactly 5 characters
      if (filtered.length === 5) {
        setCurrentGuess(filtered);
      }
    };
    
    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        await submitHandler(currentGuess);
      } finally {
        setIsSubmitting(false);
      }
    };
    
    const characters = (inputValue + '     ').slice(0, 5).split('');
    // Show cursor at current position, or at last tile if all 5 are filled
    const cursorPosition = inputValue.length === 5 ? 4 : inputValue.length;
    
    return (
      <div>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={handleChange}
            maxLength={5}
            disabled={isSubmitting}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'text',
              fontSize: '24px'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', width: '100%' }} onClick={handleTileClick}>
            {characters.map((char, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTop: '4px solid black',
                  borderBottom: '4px solid black',
                  borderLeft: index === 0 ? '4px solid black' : 'none',
                  borderRight: '4px solid black',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  padding: '5px',
                  color: 'black',
                  backgroundColor: '#02bbbb',
                  cursor: 'text',
                  position: 'relative'
                }}
              >
                {char.trim()}
                {index === cursorPosition && !isSubmitting && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      width: '60%',
                      height: '3px',
                      backgroundColor: 'white',
                      animation: 'blink 1s infinite'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <style>{`
            @keyframes blink {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
          `}</style>
        </div>
        <Button
          variant="contained"
          fullWidth
          disabled={inputValue.length !== 5 || isSubmitting}
          onClick={handleSubmit}
          sx={{fontSize: '16px', fontWeight: 'bold', color: 'white','&.Mui-disabled': { color: 'white !important' }}}
          style={{
            marginTop: '16px',
            ...(isSubmitting && {
              background: 'linear-gradient(90deg, #8a0548, #ff4da6, #8a0548)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 2s ease infinite'
            })
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Guess'}
        </Button>
      </div>
    );
  }

  return (
    <MainLayout>
      <ToastContainer />
        <style>{`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
      <PageContainer title={ pageName } description="">


        {
          address?.length == 42 ?
        <Grid container spacing={3} sx={{p: "30px 5px 0 30px"}}>

          <Grid container spacing={3} style={{ marginBottom: "20px" }}>

                <Grid item xs={4} sm={4} md={2} lg={2} key={1}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '10px'}}
                      >
                        <a href="/credits" style={{color: '#000000', textDecoration: 'underline'}}>Player Credits</a>
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                            {gettingCredits ? 'Getting...' : (game ? (Number(credits)/BASIS_POINTS).toFixed(2) : '0.00')}                       
                      </Typography>                            
                    </CardContent>
                  </Box>
                </Grid>


                <Grid item xs={4} sm={4} md={2} lg={2} key={2}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '10px'}}
                      >
                        Player Escrow
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                       { game ? (Number(game.g.credits.userEscrowBps)/BASIS_POINTS).toFixed(2) : '0.00' }
                      </Typography>
                    </CardContent>
                  </Box>
                </Grid>


                <Grid item xs={4} sm={4} md={2} lg={2} key={3}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '10px'}}
                      >
                        Game Escrow
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                       { game ? (Number(game.g.credits.poolEscrowBps + game.g.credits.treasuryEscrowBps)/BASIS_POINTS).toFixed(2) : '0.00' }
                      </Typography>
                    </CardContent>
                  </Box>
                </Grid>


                <Grid item xs={6} sm={6} md={3} lg={3} key={4}>
                  <Box bgcolor={"primary.dark"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#ffffff"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '3px'}}
                      >
                        Game Clock
                      </Typography>
                      <Typography color={"grey.600"} variant="h1" fontWeight={600} style={{fontSize: '48px'}}>
                        <div id="timeRemaining">0:00</div>
                      </Typography>
                    </CardContent>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={6} md={3} lg={3} key={5}>
                  <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '85px'}}>
                    <CardContent style={{padding: 10}}>
                      <Typography
                        color={"#096F6F"}
                        variant="h6"
                        fontWeight={600}
                        style={{marginBottom: '5px'}}
                      >
                        Game Action
                      </Typography>
                      <Typography color={"grey.600"} variant="h3" fontWeight={600}>
                          {
                            game && game?.gameId > 0 ?
                              <Button 
                                variant="contained"
                                fullWidth
                                disabled={isStarting}
                                onClick={handleSettle}
                                sx={{fontSize: '16px', fontWeight: 'bold', color: 'white','&.Mui-disabled': { color: 'white !important' }}}
                                style={{
                                  ...(isStarting && {
                                    background: 'linear-gradient(90deg, #8a0548, #ff4da6, #8a0548)',
                                    backgroundSize: '200% 100%',
                                    animation: 'gradientShift 2s ease infinite'
                                  })
                                }}
                              >
                                {isStarting ? 'Settling...' : 'Settle'}
                              </Button>
                            :
                              <Button 
                                variant="contained"
                                fullWidth
                                disabled={isStarting}
                                onClick={handleStart}
                                sx={{fontSize: '16px', fontWeight: 'bold', color: 'white','&.Mui-disabled': { color: 'white !important' }}}
                                style={{
                                  ...(isStarting && {
                                    background: 'linear-gradient(90deg, #8a0548, #ff4da6, #8a0548)',
                                    backgroundSize: '200% 100%',
                                    animation: 'gradientShift 2s ease infinite'
                                  })
                                }}
                              >
                                {isStarting ? 'Starting in 10 secs...' : 'Start'}
                              </Button>
                          }
                      </Typography>
                    </CardContent>
                  </Box>
                </Grid>
          </Grid>

        {
          game && game.gameId > 0  ?
          <>
            <Grid container spacing={3} style={{ marginBottom: "30px" }}>
                  <Grid item xs={12} sm={12} md={12} lg={12} key={1}>
                    <Box bgcolor={"white"} textAlign="center">
                      <CardContent style={{padding: "20px 5px"}}>
                        <Typography
                          color={"#aaaaaa"}
                          variant="h5"
                          fontWeight={600}
                        >
                          Game Hash
                        </Typography>
                        <div className="hashWrap">
                            <span className="hash">
                              { game && game?.g?.hash?.gameHash !== '' ? game?.g?.hash?.gameHash : TEXT_GAMEHASH }
                            </span>
                        </div>
                      </CardContent>
                    </Box>
                  </Grid>
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                {
                game.g.guessCount >= 0 ?
                  <Grid item xs={12} sm={6} md={3} lg={3} key={1}>
                    <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '195px'}}>
                      <CardContent px={1}>
                        <Typography
                          color={"#000000"}
                          variant="h5"
                          fontWeight={600}
                          style={{marginBottom: '10px'}}
                        >
                          Guess 1 
                        </Typography>
                        {
                          game.g.guessCount == 0 && expired == false ?
                            <GuessInput submitHandler={submitHandler}/>
                            :
                            <Guess guess={ game.g.guesses[0]} colors={ game.g.feedback[0] } />
                        }
                        <Typography
                          color={"#ffffff"}
                          variant="h5"
                          fontWeight={600}
                          style={{marginTop: '5px', display: game.g.guessCount == 1 && game.g.status == 2 ? 'block' : 'none'}}
                        >
                         Prize: 💎 5 Credits
                        </Typography>
                    </CardContent>
                    </Box>
                  </Grid>
                  : <></>
                }

                {
                  ((game.g.guessCount == 1 && game.g.status == 1) || game.g.guessCount >= 2) ?
                  <Grid item xs={12} sm={6} md={3} lg={3} key={2}>
                    <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '195px'}}>
                      <CardContent px={1}>
                        <Typography
                          color={"#000000"}
                          variant="h5"
                          fontWeight={600}
                          style={{marginBottom: '10px'}}
                        >
                          Guess 2
                        </Typography>
                        {
                          game.g.guessCount == 1 && expired == false?
                          <GuessInput submitHandler={submitHandler}/>
                          :
                          <Guess guess={ game.g.guesses[1]} colors={game.g.feedback[1]} />
                        }
                        <Typography
                          color={"#ffffff"}
                          variant="h5"
                          fontWeight={600}
                          style={{marginTop: '5px', display: game.g.guessCount == 2 && game.g.status == 2 ? 'block' : 'none'}}
                        >
                         Prize: 💎 4 Credits
                        </Typography>

                      </CardContent>
                    </Box>
                  </Grid>
                  : <></>
                }

                {
                  ((game.g.guessCount == 2 && game.g.status == 1) || game.g.guessCount >= 3)  ?
                  <Grid item xs={12} sm={6} md={3} lg={3} key={3}>
                    <Box bgcolor={"#02bbbb"} textAlign="center" style={{height: '195px'}}>
                      <CardContent px={1}>
                        <Typography
                          color={"#000000"}
                          variant="h5"
                          fontWeight={600}
                          style={{marginBottom: '10px'}}
                        >
                          Guess 3
                        </Typography>
                        {
                          game.g.guessCount == 2 && expired == false ?
                          <GuessInput submitHandler={submitHandler}/>
                          :
                          <Guess guess={ game.g.guesses[2]} colors={ game.g.feedback[2] } />
                        }
                        <Typography
                          color={"#ffffff"}
                          variant="h5"
                          fontWeight={600}
                          style={{marginTop: '5px', display: game.g.guessCount == 3 &&  game.g.status == 2 ? 'block' : 'none'}}
                        >
                         Prize: 💎 3 Credits
                        </Typography>
                      </CardContent>
                    </Box>
                  </Grid>
                  : <></>
                }

                {
                  game.g.status != 1 ?
                  <Grid item xs={12} sm={6} md={3} lg={3} key={4}>
                    <Box textAlign="left" style={{height: '195px'}}>
                      {
                          game.g.status == 2 ?
                              <>
                                <img src="/images/iwon.gif" style={{ height: "100%", borderRadius: "10px"}} alt="I won" />
                                <Confetti
                                  width={window.innerWidth}
                                  height={window.innerHeight}
                                  duration={5000}
                                  recycle={false}
                                  numberOfPieces={1000}
                                />
                              </>
                                :
                              <Typography
                                  color={"#ffffff"}
                                  variant="h5"
                                  fontWeight={600}
                                >
                                  Click &quot;Settle&quot; to refund any escrowed Credits and end this game.
                                </Typography>

                      }
                    </Box>
                  </Grid>
                  : <></>
                }

            </Grid>

          </>
          : <></>
          }
          <h4 style={{width: '100%', textAlign: 'center'}}>Click &quot;Settle&quot; to finalize game. All actions are final, irreversible, and non-refundable.  <a href="mailto:hashdlegame@gmail.com" style={{color: '#ffffff', textDecoration: 'underline'}}>Contact</a></h4>
        </Grid>
          
        :
        
        <></>

      }



      {     address || game || credits > 0 ?
            <></> :
            <>
            <Grid container spacing={3} sx={{p: "30px 5px 0 30px"}}>
              <h2 style={{textAlign: 'center', width: '100%'}}>Hashdle is a fun, Play-to-Earn, skill-based game</h2>

              <Grid container spacing={3} style={{ marginBottom: "20px" }}>

                    <Grid item xs={0} sm={0} md={2} lg={3} key={0}>
                    </Grid>

                    <Grid item xs={12} sm={12} md={8} lg={6} key={1}>
                      <Box bgcolor={"#20bbbb"} textAlign="center">
                        <video width="100%" autoPlay muted loop playsInline style={{padding: '5px'}}>
                          <source src="/videos/demo.mp4" type="video/mp4" />
                        </video>
                        <CardContent style={{padding: 10}}>
                          <Typography
                            color={"#ffffff"}
                            variant="h6"
                            fontWeight={500}
                            style={{textAlign: 'left', marginBottom: '10px', lineHeight: '150%'}}
                          >
                            <p>The goal is to guess a secret five-letter sequence from a 64-letter transaction &quot;Hash&quot; in three or fewer guesses within two minutes.</p>
                            <p>Each guess gives color hints:<br />
                            🟧 right letter (Hint = 0.25 Credits each)<br/>
                            ⬜️ wrong letter (Hint = 0.50 Credits each)<br/>
                            🟩 right lettter/place</p>
                            🟩🟩🟩🟩🟩 Win Credits with 5 Greens by Guess number:
                            <ul>
                              <li>Guess 1: 5 Credits</li>
                              <li>Guess 2: 4 Credits</li>
                              <li>Guess 3: 3 Credits</li>
                            </ul>

                            <p>Both Player (for Hint Fees) and Game (for Win) escrow 5 Credits each at the start of the game.</p>

                          </Typography>
                        </CardContent>
                      </Box>
                    </Grid>

                    <Grid item xs={0} sm={0} md={2} lg={3} key={2}>
                    </Grid>


              </Grid>
            </Grid>
            </>
          }
        
      </PageContainer>
    </MainLayout>
  );
}