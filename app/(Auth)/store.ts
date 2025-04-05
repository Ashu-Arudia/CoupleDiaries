// store.ts
import { create } from "zustand";

export interface Card {
  id: string;
  date: string;
  mood: string;
  location: string;
  temperature: string;
  photo: string | number;
}

export const useAppStore = create<{
  cards: Card[];
  currentContent: string;
  addCard: (card: Omit<Card, "id">) => void;
  setCurrentContent: (content: string) => void;
}>((set) => ({
  cards: [
    {
      id: "1",
      date: "January 7, 2025 | Saturday",
      mood: "Happy",
      location: "Munich",
      temperature: "79° F",
      photo: require("../../assets/images/Home_page_icons/photo1.png"),
    },
    {
      id: "2",
      date: "March 28, 2025 | Friday",
      mood: "Happy",
      location: "Munich",
      temperature: "79° F",
      photo: require("../../assets/images/Home_page_icons/photo2.png"),
    },
  ],
  currentContent: "default",
  addCard: (card) =>
    set((state) => ({
      cards: [...state.cards, { ...card, id: Date.now().toString() }],
    })),
  setCurrentContent: (content) => set({ currentContent: content }),
}));
