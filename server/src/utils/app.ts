import express from 'express'
import cors from 'cors'
import { ORIGIN } from '../constants/index'
import dotenv from 'dotenv';

import passport from 'passport';
import path from 'path';
// import bodyParser from 'body-parser';

dotenv.config();
// initialize app
const app = express();
const rootDir = path.resolve();
// middlewares

app.use(passport.initialize());
// app.use(bodyParser.json());

app.use(cors({ origin: ORIGIN }))
app.use(express.json()) // body parser
app.use(express.urlencoded({ extended: false })) // url parser

// Cấu hình phục vụ static files
// Adjust the path as needed
app.use('/uploads', express.static(path.join(rootDir, 'src/uploads')));
// Lưu ý: Đường dẫn có thể cần điều chỉnh tùy thuộc vào cấu trúc thư mục của bạn
export default app
