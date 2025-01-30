// import { NextFunction, Request, Response } from "express";
// import { type RequestHandler } from 'express';
// import joi from '../../utils/joi';
// import jwt from '../../utils/jwt';
// import crypt from '../../utils/crypt';



// const otpStore: { [key: string]: { otp: string; user: { username: string; email: string; password: string; phone?: string; avatar?: string } | null } } = {};
// // Register handler
// const register: RequestHandler = async (req, res, next) => {
//     try {
//         const schema = joi.instance.object({
//             username: joi.instance.string().required(),
//             email: joi.instance.string().required(),
//             password: joi.instance.string().required(),
//             phone: joi.instance.string().optional(),
//             avatar: joi.instance.string().optional(),
//         });

//         const { error: validationError } = schema.validate(req.body);

//         if (validationError) {
//             return next({
//                 statusCode: 400,
//                 message: validationError.details[0].message,
//             });
//         }

//         const { username, email, password, phone, avatar } = req.body;

//         // Check if the username already exists
//         const existingAccount = await Account.findOne({ $or: [{ username }, { email }] });

//         if (existingAccount) {
//             return next({
//                 statusCode: 400,
//                 message: 'Username already exists',
//             });
//         }

//         // // Hash the password
//         // const hashedPassword = await crypt.hash(password);
//         // Generate OTP
//         // Generate a 6-character OTP
        
//         // // Create a new account
//         // const newAccount = new Account({ username, email, password: hashedPassword, phone, avatar });
//         // await newAccount.save();
//         // console.log(newAccount);

//         // Send OTP to user's email
//         await sendEmail(email, 'Your OTP Code', `Your OTP code is ${otp}`);
//         // res.status(201).json({
//         //     message: 'User registered successfully',
//         //     data: newAccount,
//         // });

//         res.status(200).json({
//             message: 'OTP sent to email',
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // Verify OTP handler
// const verifyOtp: RequestHandler = async (req, res, next) => {
//     try {
//         const schema = joi.instance.object({
//             email: joi.instance.string().email().required(),
//             otp: joi.instance.string().required(),
//         });

//         const { error: validationError } = schema.validate(req.body);

//         if (validationError) {
//             return next({
//                 statusCode: 400,
//                 message: validationError.details[0].message,
//             });
//         }

//         const { email, otp } = req.body;

//         const storedData = otpStore[email];

//         if (!storedData || storedData.otp !== otp) {
//             return next({
//                 statusCode: 400,
//                 message: 'Invalid OTP',
//             });
//         }

//         // Hash the password
//         if (!storedData.user) {
//             return next({
//                 statusCode: 400,
//                 message: 'User data is missing',
//             });
//         }
//         const hashedPassword = await crypt.hash(storedData.user.password);

//         // Create a new account
//         const newAccount = new Account({ ...storedData.user, password: hashedPassword });
//         await newAccount.save();

//         // Clean up OTP store
//         delete otpStore[email];

//         res.status(201).json({
//             message: 'User registered successfully',
//             data: newAccount,
//         });
//     } catch (error) {
//         next(error);
//     }
// };



// // Login handler
// const login: RequestHandler = async (req, res, next) => {
//     try {
//         const schema = joi.instance.object({
//             username: joi.instance.string().required(),
//             password: joi.instance.string().required(),
//         });

//         const { error: validationError } = schema.validate(req.body);

//         if (validationError) {
//             return next({
//                 statusCode: 400,
//                 message: validationError.details[0].message,
//             });
//         }

//         const { username, password } = req.body;

//         // Get account from DB, and verify existence
//         const account = await Account.findOne({ username });

//         if (!account) {
//             return next({
//                 statusCode: 400,
//                 message: 'Bad credentials',
//             });
//         }

//         // Verify password hash
//         const passOk = await crypt.validate(password, account.password);

//         if (!passOk) {
//             return next({
//                 statusCode: 400,
//                 message: 'Bad credentials',
//             });
//         }

//         // Generate access token
//         const token = jwt.signToken({ uid: account._id, role: account.role });
//         console.log(token);
//         // Remove password from response data
//         const { password: _, ...accountData } = account.toObject();

//         res.status(200).json({
//             message: 'Successfully logged-in',
//             data: accountData,
//             token,
//         });
//         console.log(accountData);
//     } catch (error) {
//         next(error);
//     }
// };

// export { register, login, verifyOtp };