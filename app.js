const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

const sendEmail = require("./public/JS/sendEmail");

const app = express();
const port = 443;

const upload = multer();

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
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
  limit,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
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

// user authentication

async function checkAuthentication(req, res, next) {
  try {
    const user = await new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });

    if (user) {
      console.log("Authenticated user.");
      next(); // Continue to the next middleware or route
    } else {
      console.log("User is signed out");
      res.redirect("/login"); // Redirect to the login page
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.status(500).send("Internal Server Error");
  }
}

// routes

async function fetchDataAndRenderPage(collectionName, templateName, req, res) {
  try {
    const querySnapshot = await getDocs(
      collection(db, collectionName),
      orderBy("order")
    );
    const data = {};

    querySnapshot.docs.forEach((doc) => {
      const pageId = doc.id;
      const pageData = doc.data();

      data[pageId] = pageData;
    });

    res.render(templateName, { data });
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function fetchWithoutRender(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = {};

    querySnapshot.docs.forEach((doc) => {
      const pageId = doc.id;
      const pageData = doc.data();

      data[pageId] = pageData;
    });

    return { data };
  } catch (error) {
    console.log(error);
    console.error("Error getting documents:", error);
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
  await fetchWithoutRender("texts");

  // video ref

  const videoRef = ref(storage, "/videos/Wake.mp4");

  // render texts for index page

  try {
    const querySnapshot = await getDocs(collection(db, "texts"));
    const data = {};

    querySnapshot.docs.forEach((doc) => {
      const pageId = doc.id;
      const pageData = doc.data();

      data[pageId] = pageData;
    });

    // const videoUrl = await getDownloadURL(videoRef);

    res.render("index", { data /* videoUrl */ });
  } catch (error) {
    console.error("Error getting documents:", error);
  }
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

app.get("/rules", async (req, res) => {
  await fetchDataAndRenderPage("texts", "rules", req, res);
});

/*******************************************/
/**           // ADMIN PANEL //           **/
/*******************************************/

// GET ROUTES

app.get("/admin", checkAuthentication, (req, res) => {
  res.render("admin");
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

app.get("/admin/texts", checkAuthentication, async (req, res) => {
  try {
    const { data } = await fetchMultipleData();
    res.render("admin-texts", { data });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/partners", checkAuthentication, async (req, res) => {
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
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/gallery", checkAuthentication, async (req, res) => {
  try {
    const imagesRef = ref(storage, "images");

    // Get a list of all items (images) in the "images" folder
    const imagesList = await listAll(imagesRef);

    // Fetch the download URL for each image
    const gallery = await Promise.all(
      imagesList.items.map(async (imageRef) => {
        const url = await getDownloadURL(imageRef);
        return { imageUrl: url, name: imageRef.name };
      })
    );

    // Render the gallery page with the image URLs
    res.render("admin-gallery", { gallery });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/prices", checkAuthentication, async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "prices"));

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin-prices", { data });
  } catch (error) {
    console.error("Error getting documents for page prices:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/rules", checkAuthentication, async (req, res) => {
  fetchDataAndRenderPage("texts", "admin-rules", req, res);
});

// POST ROUTES

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

    // Redirect to the admin page after successful login
    return res.redirect("/admin");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(
      `Login failed. Error code: ${errorCode}, Message: ${errorMessage}`
    );

    // Redirect back to the login page with an error message
    return res.redirect("/login?error=true");
  }
});

// Update texts

app.post("/admin-texts/index", checkAuthentication, async (req, res) => {
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

app.post("/admin-texts/park", checkAuthentication, async (req, res) => {
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

app.post("/admin-texts/privacy", checkAuthentication, async (req, res) => {
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

// Update partners

app.post(
  "/admin/partners/update",
  checkAuthentication,
  upload.any(),
  async (req, res) => {
    try {
      // Iterate over the submitted form data
      for (const key in req.body) {
        if (key.startsWith("partner_name_")) {
          const partnerId = key.replace("partner_name_", "");

          // Extract partner information
          const partnerName = req.body[key];
          const partnerWebsite = req.body[`partner_website_${partnerId}`];

          // Update partner data in Firestore
          await setDoc(doc(db, "partners", partnerId), {
            name: partnerName,
            website: partnerWebsite,
          });

          // Check if a new image is provided
          const imageField = `partner_image_${partnerId}`;
          if (
            req.files &&
            req.files.find((file) => file.fieldname === imageField)
          ) {
            const newImageFile = req.files.find(
              (file) => file.fieldname === imageField
            );

            // Delete existing images (both .jpg and .png)
            const existingImagesRef = ref(storage, "partners");
            const existingImagesList = await listAll(existingImagesRef);

            const deletePromises = existingImagesList.items.map(
              async (item) => {
                const imageName = item.name.replace(/\.[^/.]+$/, ""); // Remove file extension
                if (imageName === partnerId) {
                  await deleteObject(item);
                }
              }
            );

            await Promise.all(deletePromises);

            // Upload the new image to Storage
            const newImageRef = ref(storage, `partners/${partnerId}.jpg`);
            await uploadBytesResumable(newImageRef, newImageFile.buffer, {
              contentType: newImageFile.mimetype,
            });
          }
        }
      }

      res.redirect("/admin/partners");
    } catch (error) {
      console.error("Error updating partner:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/admin/partners/add",
  checkAuthentication,
  upload.any(),
  async (req, res) => {
    try {
      // Get the last id from the partners collection
      const querySnapshot = await getDocs(
        query(collection(db, "partners"), orderBy("__name__", "desc"), limit(1))
      );

      if (querySnapshot.docs.length > 0) {
        const lastId = parseInt(
          querySnapshot.docs[0].id.replace("partner", "")
        );
        console.log("Last ID:", lastId);

        // Get data from the form
        const { partner_name_, partner_website_ } = req.body;

        // Image upload with id as name
        const imageField = "partner_image_";
        const newImageFile = req.files.find(
          (file) => file.fieldname === imageField
        );

        if (!newImageFile) {
          console.error("Error: File not found");
          res.status(400).send("Bad Request: File not found");
          return;
        }

        if (!newImageFile.buffer) {
          console.error("Error: File buffer is undefined");
          res.status(400).send("Bad Request: File buffer is undefined");
          return;
        }

        console.log("File Buffer Size:", newImageFile.buffer.length);

        const newImageRef = ref(storage, `partners/partner${lastId + 1}.jpg`);
        await uploadBytesResumable(newImageRef, newImageFile.buffer, {
          contentType: newImageFile.mimetype,
        });

        // Add data to the partners collection
        await setDoc(doc(db, "partners", `partner${lastId + 1}`), {
          name: partner_name_,
          website: partner_website_,
          id: lastId + 1,
        });

        res.redirect("/admin/partners");
      } else {
        // Handle the case where there are no documents in the collection
        console.error("Error: No documents found in the 'partners' collection");
        res.status(404).send("No documents found in the 'partners' collection");
      }
    } catch (error) {
      console.error("Error adding partner:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Delete partners

// Delete partners
app.post("/admin/partners/delete", checkAuthentication, async (req, res) => {
  try {
    const partnerId = req.body.partner_id;
    console.log("Deleting partner:", partnerId);

    // Delete existing images (both .jpg and .png)

    const existingImagesRef = ref(storage, "partners");
    const existingImagesList = await listAll(existingImagesRef);

    const deletePromises = existingImagesList.items.map(async (item) => {
      const imageName = item.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      if (imageName === partnerId) {
        await deleteObject(item);
      }
    });

    await Promise.all(deletePromises);

    // Delete the partner from Firestore

    await deleteDoc(doc(db, "partners", partnerId));

    res.redirect("/admin/partners");
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).send("Internal Server Error");
  }
});

// gallery delete selected images

app.post("/admin/gallery/delete", checkAuthentication, async (req, res) => {
  try {
    const selectedImages = req.body.delete || [];

    // Delete selected images by name

    const existingImagesRef = ref(storage, "images");

    const deletePromises = selectedImages.map(async (imageName) => {
      const imageRef = ref(existingImagesRef, imageName);
      await deleteObject(imageRef);
    });

    await Promise.all(deletePromises);

    res.redirect("/admin/gallery");
  } catch (error) {
    console.error("Error deleting images:", error);
    res.status(500).send("Internal Server Error");
  }
});

// gallery upload images

app.post(
  "/admin/gallery/upload",
  checkAuthentication,
  upload.any(),
  async (req, res) => {
    try {
      // Upload all the images
      const uploadPromises = req.files.map(async (file) => {
        const imageRef = ref(storage, `images/${file.originalname}`);
        await uploadBytesResumable(imageRef, file.buffer, {
          contentType: file.mimetype,
        });
      });

      await Promise.all(uploadPromises);

      res.redirect("/admin/gallery");
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post("/admin/prices/update", checkAuthentication, async (req, res) => {
  try {
    const { services, prices } = req.body;

    // Clear the existing data in the "prices" collection
    const pricesRef = collection(db, "prices");
    const snapshot = await getDocs(pricesRef);

    // Delete each document in the "prices" collection
    snapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });

    // Update the "prices" collection with the new data
    for (let i = 0; i < services.length; i++) {
      const docRef = doc(pricesRef, i.toString());
      await setDoc(docRef, {
        service: services[i],
        price: prices[i],
      });
    }

    res.redirect("/admin/prices");
  } catch (error) {
    console.error("Error updating prices:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/admin/rules/update", checkAuthentication, async (req, res) => {
  try {
    const rules = req.body;

    // Structure: { rule: [ 'a', 'b', 'c' ] }
    const rulesArray = Object.values(rules)[0];

    // Delete the entire document in the "rules" collection
    await deleteDoc(doc(db, "texts", "rules"));

    // Recreate the document and add new fields with the updated rules
    const rulesRef = doc(db, "texts", "rules");
    await setDoc(rulesRef, {});

    for (let i = 0; i < rulesArray.length; i++) {
      const field = i.toString();
      await setDoc(rulesRef, { [field]: rulesArray[i] }, { merge: true });
    }

    console.log("Rules updated successfully");
    res.status(200).redirect("/admin/rules");
  } catch (error) {
    console.error("Error updating rules:", error);
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
  console.log(`App listening at posr: ${port}`);
});
