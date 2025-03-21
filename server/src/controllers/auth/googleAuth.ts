import { Request, Response, NextFunction } from "express";
import User from "../../models/User"; 
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails?.[0].value,
                        username: profile.displayName,
                        imageUrl: profile.photos?.[0].value,
                        verified: true,
                        active: true,
                        role: "user" // Default role
                    });

                    await user.save();
                    console.log("✅ User created:", user);
                }

                // callback user
                return done(null, user);
            } catch (err : any) {
                if (err.code === 11000 && err.keyPattern.email) {
                    console.log("User with this email already exists. Updating googleId...");
                    let user = await User.findOne({ email: profile.emails?.[0]?.value });
            
                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                } else {
                    throw err;
                }
            }
        }
    )
);


export const loginWithGoogle = passport.authenticate("google", {
    scope: ["profile", "email"]
});

// export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate("google", { session: false }, (err, user, info) => {
//         if (err || !user) {
//             console.error("❌ Google authentication error:", err);
//             return res.status(401).json({ message: "Google authentication failed" });
//         }

        
//         const token = generateJwtToken(user);
//         console.log("✅ Google login successful. Token generated:", token);

//         return res.status(200).json({
//             message: "Google login successful",
//             user,
//             token
//         });
//     })(req, res, next);
// };

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: "Google authentication failed", err  } );
        }

        const token = generateJwtToken(user);

        // Redirect về frontend kèm theo token
        res.redirect(`http://localhost:5173/login?token=${token}`);
    })(req, res, next);
};

const generateJwtToken = (user: any): string => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
        expiresIn: "7d"
    });
};

export const logoutGoogle = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
}
