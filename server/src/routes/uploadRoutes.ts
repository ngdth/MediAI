import express from 'express';
import { upload } from '../utils/multer';
import { getUsers, uploadCSV } from '../controllers/uploads/uploadCsvController';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadCSV);

router.get('/users', getUsers);

export default router;
