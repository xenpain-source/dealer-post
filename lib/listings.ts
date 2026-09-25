// Placeholder in-memory data so the dashboard skeleton has something to
// render. Replace with real data fetching once there's a backend/database.
export type Listing = {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  status: "draft" | "posted";
  platforms: string[];
};

export const sampleListings: Listing[] = [
  {
    id: "1",
    year: 2018,
    make: "Honda",
    model: "Civic",
    price: 14500,
    mileage: 52000,
    status: "posted",
    platforms: ["facebook", "craigslist"],
  },
  {
    id: "2",
    year: 2016,
    make: "Toyota",
    model: "Camry",
    price: 12900,
    mileage: 68000,
    status: "posted",
    platforms: ["facebook", "instagram", "craigslist"],
  },
  {
    id: "3",
    year: 2020,
    make: "Ford",
    model: "Escape",
    price: 19800,
    mileage: 31000,
    status: "draft",
    platforms: [],
  },
];
