export type Category = "Legends" | "Elite" | "Rising Stars" | "Uncapped" | "Unsold";

export type Player = {
  id: string;
  name: string;
  role: string;
  category: Category;
  basePrice: number;
  image?: string;
  statsImage?: string;
};

export type RosterEntry = Player & { winningBid: number };

export type Team = {
  id: string;
  name: string;
  budget: number;
  roster: RosterEntry[];
  logo?: string;
};

export type Stage = "pool" | "auction" | "results";
