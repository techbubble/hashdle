/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/holdem',
  //       permanent: false, // use false if you want it temporary (307)
  //     },
  //   ];
  // },
};

module.exports = nextConfig;