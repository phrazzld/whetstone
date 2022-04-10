import create from "zustand";

export const useStore = create((set) => ({
  staleBookImage: "",
  setStaleBookImage: (bookId: string) =>
    set((state) => ({
      ...state,
      staleBookImage: bookId,
    })),
}));
