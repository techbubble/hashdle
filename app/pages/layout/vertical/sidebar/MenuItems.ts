import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
import {
  IconEngine,
  IconScript,
  IconNotes,
  IconTicket,
  IconApps,
  IconShoppingCart,
  IconShoppingCartFilled,
  IconFilterPlus,
  IconWorldQuestion,
  IconCalculator,
  IconBox,
  IconFaceId,
  IconList,
  IconPackages,
  IconStack3,
  IconCards,
  IconClockStop,
  IconBrush,
  IconCircleKey,
  IconCoins,
  IconTarget,
  IconRobot,
  IconCalendar,
} from "@tabler/icons-react";

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: " ",
  },
  {
    id: uniqueId(),
    title: "Dashboard 3.0",
    icon: IconApps,
    href: "/",
    chipColor: "secondary",
  },
  // {
  //   id: uniqueId(),
  //   title: "Buy",
  //   icon: IconShoppingCart,
  //   href: "/buy",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Account",
  //   icon: IconFaceId,
  //   href: "/account",
  //   chipColor: "secondary",
  // },
  {
    id: uniqueId(),
    title: "Hatchling Hold'em",
    icon: IconCards,
    href: "/holdem",
    chipColor: "secondary",
  },
  {
    id: uniqueId(),
    title: "Hatchling Guide",
    icon: IconNotes,
    href: "/guide",
    chipColor: "secondary",
  },
  // {
  //   id: uniqueId(),
  //   title: "Claim Queue",
  //   icon: IconStack3,
  //   href: "/queue",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "EARN Folio of Tokens",
  //   icon: IconPackages,
  //   href: "/eft",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Leaderboard",
  //   icon: IconList,
  //   href: "/leaderboard",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "EARN Calculator",
  //   icon: IconCalculator,
  //   href: "/calculator",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "EARN Target",
  //   icon: IconTarget,
  //   href: "/target",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Investment Thesis",
  //   icon: IconCoins,
  //   href: "/thesis",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "FAQ",
  //   icon: IconWorldQuestion,
  //   href: "/faq",
  //   chipColor: "secondary",
  // }
  
];

export default Menuitems;

/*

{
    id: uniqueId(),
    title: "Ecommerce",
    icon: IconBasket,
    href: "/apps/ecommerce/",
    children: [
      {
        id: uniqueId(),
        title: "Shop",
        icon: IconPoint,
        href: "/apps/ecommerce/shop",
      },
      {
        id: uniqueId(),
        title: "Detail",
        icon: IconPoint,
        href: "/apps/ecommerce/detail/1",
      },
      {
        id: uniqueId(),
        title: "List",
        icon: IconPoint,
        href: "/apps/ecommerce/list",
      },
      {
        id: uniqueId(),
        title: "Checkout",
        icon: IconPoint,
        href: "/apps/ecommerce/checkout",
      },
    ],
  },
*/