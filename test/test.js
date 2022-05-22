const firebase = require("@firebase/testing");

const PROJECT_ID = "whetstone-books";
const myId = "user_abc";
const theirId = "user_xyz";
const myAuth = { uid: myId, email: "test@test.net" };

const getFirestore = (auth) => {
  return firebase
    .initializeTestApp({ projectId: PROJECT_ID, auth: auth })
    .firestore();
};

const getAdminFirestore = () => {
  return firebase.initializeAdminApp({ projectId: PROJECT_ID }).firestore();
};

beforeEach(async () => {
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});

describe("Firestore security rules", () => {
  describe("unauthenticated", () => {
    it("cannot read books", async () => {
      const db = getFirestore(null);
      const testBook = db.collection("books").doc("testBook");
      await firebase.assertFails(testBook.get());
    });

    it("cannot write books", async () => {
      const db = getFirestore(null);
      const testBook = db.collection("books").doc("testBook");
      await firebase.assertFails(testBook.set({ title: "Forbidden" }));
    });

    it("cannot read notes", async () => {
      const db = getFirestore(null);
      const testNote = db.collection("notes").doc("testNote");
      await firebase.assertFails(testNote.get());
    });

    it("cannot write notes", async () => {
      const db = getFirestore(null);
      const testNote = db.collection("notes").doc("testNote");
      await firebase.assertFails(testNote.set({ content: "No can do." }));
    });
  });

  describe("authenticated", () => {
    it("cannot read books that belong to another user", async () => {
      const admin = getAdminFirestore();
      const bookId = "theirBook";
      const setupDoc = admin
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId);
      await setupDoc.set({
        userId: theirId,
        title: "This Doesn't Belong to You",
      });

      const db = getFirestore(myAuth);
      const theirBook = db
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId);
      await firebase.assertFails(theirBook.get());
    });

    it("cannot write books that belong to another user", async () => {
      const db = getFirestore(myAuth);
      const testBook = db
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc("testBook");
      await firebase.assertFails(testBook.set({ title: "Forbidden" }));
    });

    it("cannot read notes that belong to another user", async () => {
      const admin = getAdminFirestore();
      const bookId = "theirBook";
      const setupBook = admin
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId);
      await setupBook.set({
        userId: theirId,
        title: "This Doesn't Belong to You",
      });
      const noteId = "theirNote";
      const setupNote = admin
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId)
        .collection("notes")
        .doc(noteId);
      await setupNote.set({
        content: "Random stuff",
      });

      const db = getFirestore(myAuth);
      const testNote = db
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId)
        .collection("notes");
      await firebase.assertFails(testNote.get());
    });

    it("cannot write notes that belong to another user", async () => {
      const admin = getAdminFirestore();
      const bookId = "theirBook";
      const setupBook = admin
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId);
      await setupBook.set({
        userId: theirId,
        title: "This Doesn't Belong to You",
      });
      const noteId = "theirNote";
      const setupNote = admin
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId)
        .collection("notes")
        .doc(noteId);
      await setupNote.set({
        content: "Stuff someone else would write",
      });

      const db = getFirestore(myAuth);
      const testNote = db
        .collection("users")
        .doc(theirId)
        .collection("books")
        .doc(bookId)
        .collection("notes")
        .doc(noteId);
      await firebase.assertFails(testNote.set({ content: "So failure." }));
    });

    it("can read books that belong to the authenticated user", async () => {
      const admin = getAdminFirestore();
      const bookId = "myBook";
      const setupBook = admin
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId);
      await setupBook.set({
        userId: myId,
        title: "Lila",
      });

      const db = getFirestore(myAuth);
      const testQuery = db
        .collection("users")
        .doc(myId)
        .collection("books")
        .where("userId", "==", myId);
      await firebase.assertSucceeds(testQuery.get());
    });

    it("can write books that belong to the authenticated user", async () => {
      const admin = getAdminFirestore();
      const bookId = "myBook";
      const setupBook = admin
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId);
      await setupBook.set({
        userId: myId,
        title: "Lila",
      });

      const db = getFirestore(myAuth);
      const testBook = db
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId);
      await firebase.assertSucceeds(
        testBook.set({ title: "The Lord of the Rings" })
      );
    });

    it("can create new books", async () => {
      const db = getFirestore(myAuth);
      const bookId = "newBook";
      const testBook = db
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId);
      await firebase.assertSucceeds(
        testBook.set({ userId: myId, title: "New Book" })
      );
    });

    it("can read notes that belong to the authenticated user", async () => {
      const admin = getAdminFirestore();
      const bookId = "myBook";
      const setupBook = admin
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId);
      await setupBook.set({
        userId: myId,
        title: "Lila",
      });
      const noteId = "myNote";
      const setupNote = admin
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId)
        .collection("notes")
        .doc(noteId);
      await setupNote.set({
        content: "Stuff that I would write",
      });

      const db = getFirestore(myAuth);
      const testNote = db
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId)
        .collection("notes");
      await firebase.assertSucceeds(testNote.get());
    });

    it("can write notes that belong to the authenticated user", async () => {
      const admin = getAdminFirestore();
      const bookId = "myBook";
      const setupBook = admin
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId);
      await setupBook.set({
        userId: myId,
        title: "Lila",
      });
      const noteId = "myNote";
      const setupNote = admin
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId)
        .collection("notes")
        .doc(noteId);
      await setupNote.set({
        content: "Stuff that I would write",
      });

      const db = getFirestore(myAuth);
      const testNote = db
        .collection("users")
        .doc(myId)
        .collection("books")
        .doc(bookId)
        .collection("notes")
        .doc(noteId);
      await firebase.assertSucceeds(testNote.set({ content: "Much success." }));
    });
  });
});

after(async () => {
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});
