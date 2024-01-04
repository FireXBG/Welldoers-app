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
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} = require("firebase/firestore");
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
    const data = {};

    querySnapshot.docs.forEach((doc) => {
      const pageId = doc.id;
      const pageData = doc.data();

      // Assuming pageData has fields like header1, paragraph1, etc.
      data[pageId] = pageData;
    });

    res.render(templateName, { data });
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function fetchMultipleData() {
  try {
    const querySnapshot = await getDocs(collection(db, "texts"));
    const data = {};

    querySnapshot.docs.forEach((pageDoc) => {
      const pageId = pageDoc.id;
      const pageData = pageDoc.data();

      // Clean up spaces in each field of pageData
      Object.keys(pageData).forEach((field) => {
        if (typeof pageData[field] === "string") {
          pageData[field] = pageData[field].replace(/\s+/g, " ").trim();
        }
      });

      // Assuming each pageData has fields like header1, paragraph1, etc.
      data[pageId] = pageData;
    });

    return { data };
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
}

// Define routes using the common function
app.get("/", async (req, res) => {
  await fetchDataAndRenderPage("texts", "index", req, res);
});

app.get("/park", async (req, res) => {
  await fetchDataAndRenderPage("texts", "park", req, res);
});

app.get("/privacy", async (req, res) => {
  await fetchDataAndRenderPage("texts", "privacy", req, res);
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

    // Render gallery page with the image URLs
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

app.get("/admin/texts", async (req, res) => {
  // Check the authentication state
  const user = auth.currentUser;

  if (user) {
    try {
      const { data } = await fetchMultipleData();
      res.render("admin-texts", { data });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    // User is not authenticated, redirect to login
    res.redirect("/login");
  }
});

app.get("/admin/partners", async (req, res) => {
  // Check the authentication state
  const user = auth.currentUser;

  if (user) {
    // User is authenticated, fetch data and render the admin page
    try {
      const querySnapshot = await getDocs(collection(db, "partners"));
      const data = querySnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      // Get images from storage with ordered id by last number sliced
      const imagesRef = ref(storage, "partners");
      const imagesList = await listAll(imagesRef);

      const imageUrls = await Promise.all(
        imagesList.items.map(async (imageRef) => {
          const imageName = imageRef.name.replace(/\.[^/.]+$/, ""); // Remove file extension
          const imageUrl = await getDownloadURL(imageRef).catch(() => null); // Handle the case where the image doesn't exist
          return { imageUrl, name: imageName };
        })
      );

      // Render the page with the data and the images
      res.render("admin-partners", { data, imageUrls });
      console.log(data, imageUrls);
    } catch (error) {
      console.error("Error getting documents:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    // User is not authenticated, redirect to login
    res.redirect("/login");
  }
});

app.get("/admin/gallery", async (req, res) => {
  // Check the authentication state
  const user = auth.currentUser;

  if (user) {
    try {
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

      // Render the gallery page with the image URLs
      res.render("admin-gallery", { imageUrls });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    // User is not authenticated, redirect to login
    res.redirect("/login");
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

// Update texts

app.post("/admin-texts/index", async (req, res) => {
  const {
    header1,
    paragraph1,
    line1Heading,
    line1Paragraph,
    line2Heading,
    line2Paragraph,
  } = req.body;

  try {
    await setDoc(doc(db, "texts", "index"), {
      header1,
      paragraph1,
      line1Heading,
      line1Paragraph,
      line2Heading,
      line2Paragraph,
    });
    res.redirect("/admin/texts");
  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/admin-texts/park", async (req, res) => {
  const { heading1, heading2, paragraph1 } = req.body;

  try {
    await setDoc(doc(db, "texts", "park"), {
      heading1,
      heading2,
      paragraph1,
    });
    res.redirect("/admin/texts");
  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/admin-texts/privacy", async (req, res) => {
  const { heading1, paragraph1 } = req.body;

  try {
    await setDoc(doc(db, "texts", "privacy"), {
      heading1,
      paragraph1,
    });
    res.redirect("/admin/texts");
  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).send("Internal Server Error");
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
