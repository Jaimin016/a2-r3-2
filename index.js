require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path")
const fs = require("fs")


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage: storage });


app
    .route("/upload")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "views", "upload.html"));
    })
    .post(upload.single("file"), (req, res) => {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        res.send(`File uploaded successfully: ${req.file.path}`);
    });


app
    .route("/upload-multiple")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
    })
    .post(upload.array("files", 100), (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded.");
        }
        const filePaths = req.files.map((file) => file.path);
        res
            .status(200)
            .send(`Files uploaded successfully: ${filePaths.join(", ")}`);
    });


app.get('/fetch-single', (req, res) => {
    let upload_dir = path.join(__dirname, 'uploads');
    let uploads = fs.readdirSync(upload_dir);
    if (uploads.length == 0) {
        return res.status(503).send({ message: 'No images' });
    }
    let max = uploads.length - 1;
    let min = 0;
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    let randomImage = uploads[index];
    res.sendFile(path.join(upload_dir, randomImage));
});

app.get('/fetch-single-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'fetch-single.html'));
});


app.get("/multiple-images", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "multiple-images.html"));
});

// Handle the form submission for multiple images
app.post("/fetch-multiple", (req, res) => {
    const numImages = parseInt(req.body.numImages, 10);
    const uploads = fs.readdirSync(uploadsDir);

    if (uploads.length === 0) {
        return res.status(503).send({
            message: "No images",
        });
    }

    const randomImages = [];
    for (let i = 0; i < numImages; i++) {
        const index = Math.floor(Math.random() * uploads.length);
        randomImages.push(uploads[index]);
    }

    res.json({ images: randomImages });
});

// Fetch multiple random images
app.get('/fetch-multiple', (req, res) => {
    const numImages = parseInt(req.query.numImages, 10) || 1;
  
    fs.readdir('uploads/', (err, files) => {
      if (err) {
        return res.status(500).send('Error reading directory');
      }
  
      if (numImages > files.length) {
        return res.status(400).send('Requested number of images exceeds available images');
      }
  
      const selectedImages = [];
      const usedIndexes = new Set();
  
      while (selectedImages.length < numImages) {
        const randomIndex = Math.floor(Math.random() * files.length);
        if (!usedIndexes.has(randomIndex)) {
          selectedImages.push(files[randomIndex]);
          usedIndexes.add(randomIndex);
        }
      }
  
      res.json(selectedImages);
    });
  });


app.get("/gallery", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gallery.html"));
});

// Fetch all images from the server
app.get('/fetch-all', (req, res) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.json(files);
    });
});

app.get("/gallery-pagination", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gallery-pagination.html"));
});

// Fetch paginated images
app.get('/fetch-all/pages/:pageIndex', (req, res) => {
    const pageIndex = parseInt(req.params.pageIndex) || 1;
    const itemsPerPage = parseInt(req.query.items_per_page) || 10;

    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return res.sendStatus(500);
        }

        const totalPages = Math.ceil(files.length / itemsPerPage);
        const startIndex = (pageIndex - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, files.length);
        const paginatedFiles = files.slice(startIndex, endIndex).map(file => ({
            url: `/uploads/${file}`,
            name: file
        }));

        res.json({
            page: pageIndex,
            totalPages,
            files: paginatedFiles
        });
    });
});

app.use((req, res) => {
    res.status(404).send("Route not found");
});
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
