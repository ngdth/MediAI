import dotenv from 'dotenv';

dotenv.config();

export const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://amma-care.com/auth/google/callback',
    sessionSecret: process.env.SESSION_SECRET || 'secret-key'
};
