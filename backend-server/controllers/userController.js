// userController.js
const { User } = require('../model/users');
const cloudinary = require('cloudinary');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    cb(null, Date.now() + fileExtension);
  }
});

const upload = multer({ storage: storage }).single('profilePicture');

cloudinary.config({
  cloud_name: 'dmwx6fewz',
  api_key: '989872595357354',
  api_secret: 'fgQsIWQTFXzTRLV3pfVzUA1tWL8'
});


const uploadProfilePicture = (req, res) => {
  console.log(req.files)
    upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      console.log(req.files)
      // Upload the image to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
      const profilePictureUrl = cloudinaryResult.secure_url;

      // Find the user by email
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Save the Cloudinary URL to the user's profile picture field
      user.profilePicture = profilePictureUrl;
      await user.save();

      res.status(200).json({
        message: 'Profile picture uploaded successfully!',
        profilePictureUrl
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ message: 'Server error while uploading profile picture' });
    }
  });
};


module.exports = { uploadProfilePicture };
