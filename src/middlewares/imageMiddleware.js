import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';


dotenv.config();

AWS.config.update({
  region: 'ap-northeast-2',
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp']

const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'my-first-image-buck',
    key: (req, file, callback) => {
      const uploadDirectory = req.query.directory ?? ''
      const extension = path.extname(file.originalname);
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error('Wrong extension'))
      }
    },
    acl: 'public-read-write'
  })
});

export default imageUploader