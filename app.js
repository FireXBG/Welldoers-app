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
const {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} = require("firebase/auth");

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
const auth = getAuth();

const user = auth.currentUser;

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

app.get("/privacy", async (req, res) => {
  await fetchDataAndRenderPage("texts-privacy", "privacy", req, res);
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

app.get("/friends", async (req, res) => {
  // first get the friends collection with ordered id by last number sliced.

  const querySnapshot = await getDocs(collection(db, "partners"));
  const data = querySnapshot.docs.reduce((acc, doc) => {
    acc[doc.id] = doc.data();
    return acc;
  }, {});

  // then get images from storage with ordered id by last number sliced

  const imagesRef = ref(storage, "partners");
  const imagesList = await listAll(imagesRef);

  const imageUrls = await Promise.all(
    imagesList.items.map(async (imageRef) => {
      const url = await getDownloadURL(imageRef);
      return { imageUrl: url, name: imageRef.name };
    })
  );

  // then render the page with the data and the images

  res.render("friends", { data, imageUrls });
});

// admin panel system

app.get("/admin", (req, res) => {
  // Check the authentication state
  const user = auth.currentUser;

  if (user) {
    // User is authenticated, render the admin page
    res.render("admin");
  } else {
    // User is not authenticated, redirect to login
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: req.query.error });
});

app.post("/logout", async (req, res) => {
  try {
    // Assuming you are using Firebase authentication
    await signOut(auth);

    // Redirect to the login page after successful logout
    res.redirect("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Perform the login using Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    res.redirect("/admin");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(
      `Login failed. Error code: ${errorCode}, Message: ${errorMessage}`
    );

    // Redirect back to the login page with an error message
    res.redirect("/login?error=true");
  }
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
