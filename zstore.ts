import create from "zustand";

type State = {
  staleBookImage: string;
  setStaleBookImage: (bookId: string) => void;
  staleNoteImage: string;
  setStaleNoteImage: (noteId: string) => void;
};

export const useStore = create<State>((set) => ({
  staleBookImage: "",
  setStaleBookImage: (bookId: string) =>
    set((state: State) => ({
      ...state,
      staleBookImage: bookId,
    })),
  staleNoteImage: "",
  setStaleNoteImage: (noteId: string) =>
    set((state: State) => ({
      ...state,
      staleBookImage: noteId,
    })),
}));
