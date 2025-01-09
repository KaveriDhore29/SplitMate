import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dmwx6fewz',
    api_key: '989872595357354',
    api_secret: 'fgQsIWQTFXzTRLV3pfVzUA1tWL8'
  });
  

export default cloudinary;
