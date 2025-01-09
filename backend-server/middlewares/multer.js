const multer = require('multer');
const path = require('path');

// Configure storage settings for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store the file temporarily in the 'uploads/' folder
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Give the file a unique name by appending a timestamp
    const fileExtension = path.extname(file.originalname); // Get file extension (.jpg, .png)
    cb(null, Date.now() + fileExtension); // Use timestamp to avoid overwriting files
  }
});

// Initialize Multer with the defined storage configuration
const upload = multer({ storage: storage }).single('file'); // 'profilePicture' is the field name in the frontend form

module.exports = upload;
