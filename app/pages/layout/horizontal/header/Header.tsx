import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Theme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';

import { useSelector, useDispatch } from '@/app/store/hooks';
import Navigation from '../../vertical/header/Navigation';
import Logo from '../../shared/logo/Logo';
import { AppState } from '@/app/store/store';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',

    [theme.breakpoints.up('lg')]: {
     // minHeight: customizer.TopbarHeight,
    },
  }));
    const ToolbarStyled = styled(Toolbar)(({theme}) => ({ margin: '0 auto', width: '100%', color: `${theme.palette.text.secondary} !important`, }));

  return (
    <AppBarStyled position="sticky" color="default" elevation={8}>
      <ToolbarStyled
        sx={{
          maxWidth: customizer.isLayout === 'boxed' ? 'lg' : '100%!important',
        }}
      >
        <Box sx={{  overflow: 'hidden' }}>
          <Logo />
        </Box>
        <Box flexGrow={1} />
        <Navigation />
        <Stack spacing={1} direction="row" alignItems="center" style={{marginLeft: "10px", marginRight: "10px"}}>
           <ConnectButton   />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
