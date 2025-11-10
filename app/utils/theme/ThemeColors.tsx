const ThemeColors = [
  {
    name: 'BLUE_THEME',
    palette: {
      primary: {
        main: '#0074BA',
        light: '#EFF9FF',
        dark: '#006DAF',
      },
      secondary: {
        main: '#47D7BC',
        light: '#EDFBF7',
        dark: '#39C7AD',
      },
    },
  },
  {
    name: 'PINK_THEME',
    palette: {
      primary: {
        main: '#02bbbc',         // Vivid pink (material pink 500)
        light: '#FCE4EC',        // Very light pink for backgrounds
        dark: '#02bbbc',         // Deeper pink for active states
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#FFB6C1',         // Soft pink
        light: '#FFE6EB',        // Light background tint
        dark: '#FF7F9D',         // Stronger supporting pink
        contrastText: '#ffffff',
      },
    },
  },
  {
    name: 'GREEN_THEME',
    palette: {
      primary: {
        main: '#0A7EA4',
        light: '#F4F9FB',
        dark: '#06769A',
      },
      secondary: {
        main: '#CCDA4E',
        light: '#FAFBEF',
        dark: '#C3D046',
      },
      background: {
        default: '#f8fffc',
        dark: '#ffffff',
        paper: '#ffffff',
      },
    },
  },
  {
    name: 'PURPLE_THEME',
    palette: {
      primary: {
        main: '#763EBD',
        light: '#F2ECF9',
        dark: '#c129c3',
      },
      secondary: {
        main: '#95CFD5',
        light: '#EDF8FA',
        dark: '#8BC8CE',
      },
    },
  },
  {
    name: 'ORANGE_THEME',
    palette: {
      primary: {
        main: '#FA896B',
        light: '#FBF2EF',
        dark: '#F48162',
      },
      secondary: {
        main: '#0074BA',
        light: '#EFF9FF',
        dark: '#006FB1',
      },
    },
  },
  {
    name: 'CYAN_THEME',
    palette: {
      primary: {
        main: '#01C0C8',
        light: '#EBF9FA',
        dark: '#00B9C0',
      },
      secondary: {
        main: '#FB9678',
        light: '#FFF5F2',
        dark: '#F48B6C',
      },
    },
  },
];

export default ThemeColors;
