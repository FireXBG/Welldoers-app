const express = require("express");
const sendEmail = require("./public/JS/sendEmail");
const bodyParser = require("body-parser");
const app = express();
const port = 443;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// firebase

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { collection, doc, getDoc, getDocs } = require("firebase/firestore");
const {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
} = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyByQyDLsyd_zm6PEQxtIEI5tWtwzO4Pf7I",
  authDomain: "welldoers.firebaseapp.com",
  projectId: "welldoers",
  storageBucket: "welldoers.appspot.com",
};

const firebaseApp = initializeApp(firebaseConfig);

// initializeDB

const db = getFirestore();
const storage = getStorage(firebaseApp);

// routes

async function fetchDataAndRenderPage(collectionName, templateName, req, res) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data().content;
      return acc;
    }, {});
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

app.get("/gallery", async (req, res) => {
  try {
    // Get a reference to the "images" folder
    const imagesRef = ref(storage, "images");

    // Get a list of all items (images) in the "images" folder
    const imagesList = await listAll(imagesRef);

    // Fetch the download URL for each image
    const imageUrls = await Promise.all(
      imagesList.items.map(async (imageRef) => {
        const url = await getDownloadURL(imageRef);
        return { imageUrl: url, name: imageRef.name };
      })
    );

    // Render your gallery page with the image URLs
    res.render("gallery", { imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/contacts", async (req, res) => {
  res.render("contacts");
});

// email handle

app.post("/send", (req, res) => {
  sendEmail(req.body)
    .then((info) => {
      const currentURL = `${req.protocol}://${req.get("host")}`;
      res.redirect(`${currentURL}/contacts?success=true`);
    })
    .catch((err) => {
      const currentURL = `${req.protocol}://${req.get("host")}`;
      res.redirect(`${currentURL}/contacts?success=false`);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
