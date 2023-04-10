const cloudinary = require("cloudinary").v2;

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploads = (req, folder) => {
  const file = req.file.path;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.unsigned_upload(
      file,
      "h6sy41zc",
      {
        resource_type: "auto",
        folder: folder,
      },
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          fileName: result.original_filename,
          id: result.public_id,
        });
      }
    );
  });
};

const uploader = async (path, folderName) => await uploads(path, folderName);

// add a new function to delete a file
const deleteFile = (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  });
};

module.exports = {
  uploader,
  deleteFile, // export the new function
};
