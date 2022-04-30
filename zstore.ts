import create from "zustand";

export const useStore = create((set) => ({
  staleBookImage: "",
  setStaleBookImage: (bookId: string) =>
    set((state) => ({
      ...state,
      staleBookImage: bookId,
    })),
  showActionMenu: false,
  setShowActionMenu: (show: boolean) =>
    set((state) => ({ ...state, showActionMenu: show })),
}));
