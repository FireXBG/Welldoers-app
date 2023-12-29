const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

// firebase

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { collection, doc, getDoc, getDocs } = require("firebase/firestore");
const { get } = require("http");

const firebaseConfig = {
  apiKey: "AIzaSyByQyDLsyd_zm6PEQxtIEI5tWtwzO4Pf7I",
  authDomain: "welldoers.firebaseapp.com",
  projectId: "welldoers",
  storageBucket: "welldoers.appspot.com",
};

const firebaseApp = initializeApp(firebaseConfig);

// initializeDB

const db = getFirestore();

// routes

async function fetchDataAndRenderPage(collectionName, templateName, req, res) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data().content;
      return acc;
    }, {});
    console.log("Data:", data); // Add this line for debugging
    res.render(templateName, { data });
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Define routes using the common function
app.get("/", async (req, res) => {
  await fetchDataAndRenderPage("texts-index", "index", req, res);
});

app.get("/park", async (req, res) => {
  const data = await getLandingPageTexts();
  await fetchDataAndRenderPage("texts-park", "park", req, res);
});

// custom logic for prices page
app.get("/prices", async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "prices"));
    const data = querySnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});
    res.render("prices", { data });
  } catch (error) {
    console.error("Error getting documents:", error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// dynamic content functions

// get texts for landing page typed.js animation. File name: indexTypingAnimation.js
async function getLandingPageTexts() {
  try {
    const documentId = "typedJStexts"; // Replace with the actual document ID
    const docRef = doc(db, "texts-index", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const typedJSData = docSnap.data();
      const typedJSDataArray = Object.values(typedJSData);
      return typedJSDataArray;
    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

module.exports = { getLandingPageTexts };
