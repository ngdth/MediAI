import express from 'express'
import cors from 'cors'
import { ORIGIN } from '../constants/index'
import dotenv from 'dotenv';

import passport from 'passport';
import bodyParser from 'body-parser';

dotenv.config();
// initialize app
const app = express()

// middlewares

app.use(passport.initialize());
app.use(bodyParser.json());

app.use(cors({ origin: ORIGIN }))
app.use(express.json()) // body parser
app.use(express.urlencoded({ extended: false })) // url parser


export default app
