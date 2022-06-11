/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as admin from "firebase-admin";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
    interface BookParamList extends BookStackParamList { }
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  AddBook: EditBookScreenParams | undefined;
  EditBook: EditBookScreenParams;
  AddNote: AddNoteScreenParams | undefined;
  AddVocab: AddNoteScreenParams | undefined;
  ManageReadingDates: ManageReadingDatesScreenParams;
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

export type ReadDates = {
  started: admin.firestore.Timestamp | Date;
  finished: admin.firestore.Timestamp | Date | null;
}

export type TBook = {
  id: string;
  title: string;
  author: string;
  readingDates?: Array<ReadDates>;
  started?: admin.firestore.Timestamp | Date;
  finished?: admin.firestore.Timestamp | Date;
  createdAt: admin.firestore.Timestamp | Date;
  updatedAt?: admin.firestore.Timestamp | Date;
};

export type BookPayload = {
  title: string;
  author: string;
  started?: admin.firestore.Timestamp | Date | null;
  finished?: admin.firestore.Timestamp | Date | null;
  createdAt?: admin.firestore.Timestamp | Date | null;
  updatedAt?: admin.firestore.Timestamp | Date | null;
}

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

export type TNote = {
  id: string;
  bookId?: string;
  content?: string;
  type?: "note" | "vocab";
  word?: string;
  definition?: string;
  page?: number;
  createdAt: admin.firestore.Timestamp | Date;
  updatedAt?: admin.firestore.Timestamp | Date;
};

export type TBookList = "Reading" | "Finished" | "Unread";

export type BooksScreenParams = {
  tab?: number;
};

export type AddNoteScreenParams = {
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

export type ManageReadingDatesScreenParams = {
  book: TBook;
}

export type BookDetailsScreenRouteProp = RouteProp<
  BookStackParamList,
  "BookDetails"
>;
