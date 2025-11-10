import { useState } from "react";
import Button from '@mui/material/Button';
import Link from "next/link";

const AppDD = () => {

  return (
    <>
      <Button
        color="inherit"
        sx={{ fontSize: "18px", color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/"
        component={Link}
      >
        Play
      </Button>
      <Button
        color="inherit"
        sx={{ fontSize: "18px", color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/credits"
        component={Link}
      >
        Credits
      </Button>
      <Button
        color="inherit"
        sx={{ fontSize: "18px", color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/faq"
        component={Link}
      >
        FAQ
      </Button>
    </>
  );
};

export default AppDD;
