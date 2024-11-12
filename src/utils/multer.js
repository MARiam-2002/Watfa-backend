import multer, { diskStorage } from "multer";

export const filterObject = {
  image: ["image/png", "image/jpeg"],
  pdf: ["application/pdf"],
  video: ["video/mp4"],
};
export const fileUpload = (filterArray) => {
  const fileFilter = (req, file, cb) => {
    if (!filterArray.includes(file.mimetype)) {
      return cb(new Error("invalid file formate"), false);
    }
    return cb(null, true);
  };

  return multer({ storage: diskStorage({}), fileFilter });
};
