/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { Timestamp } from "@firebase/firestore";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
    interface BookParamList extends BookStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  AddBook: EditBookScreenParams | undefined;
  EditBook: EditBookScreenParams;
  AddNote: EditNoteScreenParams | undefined;
  EditNote: EditNoteScreenParams | undefined;
  AddVocab: EditNoteScreenParams | undefined;
  EditVocab: EditNoteScreenParams | undefined;
  AddDateNote: EditNoteScreenParams | undefined;
  EditDateNote: EditNoteScreenParams | undefined;
  SignUp: undefined;
  NotFound: undefined;
};

export type BookStackParamList = {
  BookDetails: BookDetailsScreenParams;
  Books: BooksScreenParams | undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  BookStack: undefined;
  Profile: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type TBook = {
  id: string;
  title: string;
  author: string;
  list: "reading" | "finished" | "unread";
  migrated?: boolean;
  lastStarted?: Timestamp | Date | null;
  lastFinished?: Timestamp | Date | null;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
};

export type BookPayload = {
  title: string;
  author: string;
  list: "reading" | "finished" | "unread";
  lastStarted?: Timestamp | Date | null;
  lastFinished?: Timestamp | Date | null;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
};

export type NotePayload = {
  content: string;
  type: "note";
  page?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type VocabPayload = {
  type: "vocab";
  word: string;
  definition: string;
  page?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type DateNotePayload = {
  type: "started" | "finished" | "shelved";
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TNote = {
  id: string;
  bookId?: string;
  content?: string;
  date?: Timestamp | Date;
  type: "note" | "vocab" | "started" | "finished" | "shelved";
  word?: string;
  definition?: string;
  page?: number;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
};

export type TBookList = "reading" | "finished" | "unread";

export type BooksScreenParams = {
  tab?: number;
};

export type EditNoteScreenParams = {
  bookId?: string;
  editNote?: TNote;
  editVocab?: TNote;
};

export type BookDetailsScreenParams = {
  book: TBook;
};

export type EditBookScreenParams = {
  book?: TBook;
};

export type BookDetailsScreenRouteProp = RouteProp<
  BookStackParamList,
  "BookDetails"
>;
