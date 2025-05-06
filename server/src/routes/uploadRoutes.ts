import express from 'express';
import { fileUpload } from '../utils/multer';
import { getUsers, uploadFile,  } from '../controllers/uploads/uploadCsvController';

const router = express.Router();

router.post('/upload', fileUpload.single('file'), uploadFile);

router.get('/users', getUsers);

export default router;
