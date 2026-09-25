// Central list of platforms the product targets. Used by the landing page
// and the "new listing" placeholder screen so the two stay in sync.
export type Platform = {
  id: string;
  name: string;
  status: "planned" | "in-progress" | "live";
  note: string;
};

export const platforms: Platform[] = [
  {
    id: "facebook",
    name: "Facebook Marketplace",
    status: "planned",
    note: "Requires an approved inventory partner integration.",
  },
  {
    id: "instagram",
    name: "Instagram",
    status: "planned",
    note: "Post as feed content linking back to the listing.",
  },
  {
    id: "craigslist",
    name: "Craigslist",
    status: "planned",
    note: "Manual-assist posting to start.",
  },
];
