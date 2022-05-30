import create from "zustand";

type State = {
  staleBookImage: string;
  setStaleBookImage: (bookId: string) => void;
};

export const useStore = create<State>((set) => ({
  staleBookImage: "",
  setStaleBookImage: (bookId: string) =>
    set((state: State) => ({
      ...state,
      staleBookImage: bookId,
    })),
}));
