import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from '@/app/store/hooks';
import { IconPower } from '@tabler/icons-react';
import { AppState } from '@/app/store/store';
import Link from 'next/link';

export const Profile = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';

  return (
    <Box
      sx={{ m: 3, p: 1 }}
    >
      {!hideMenu ? (
        <>
          <h1 style={{fontSize: '1.8em', lineHeight: '1.8em', display: 'block', textAlign: 'center'}}>Sabong Studios EARN3</h1>
          <Typography style={{textAlign: 'center'}}>v0.9.0</Typography>
        </>
      ) : (
        ''
      )}
    </Box>
  );
};
