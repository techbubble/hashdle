import { FC } from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from "next/link";
import { styled } from '@mui/material/styles'
import { AppState } from "@/app/store/store";
import Image from "next/image";
import { Theme } from '@mui/material/styles';

const Logo = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const logoSrc = isMobile
    ? '/images/hashdle-logomark.png'
    : '/images/hashdle-logo.png';

  const LinkStyled = styled(Link)(() => ({
    height: "50px",
    width: `${isMobile ? "60px" : "220px"}`,
    display: "block",
  }));

  return (
    <LinkStyled href="/">
        <Image
          src={ logoSrc }
          alt="logo"
          height={45.46}
          width={isMobile ? 45.46 : 220}
          priority
        />
    </LinkStyled>
  );
};

export default Logo;
