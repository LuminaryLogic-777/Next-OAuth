import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import User from "@models/user";


// console.log( {clientId:process.env.GOOGLE_ID,
//     clientSecret:process.env.GOOGLE_SECRET});

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
            try {
                const sessionUser = await User.findOne({
                    email: session.user.email
                });
                if (sessionUser) {
                    session.user.id = sessionUser._id.toString();
                }
                return session;
            } catch (error) {
                console.error("Error in session callback:", error);
                throw error; // Rethrow the error to propagate it
            }
        },
        async signIn({ profile }) {
            try {
                await connectToDB();
                // Check if a user already exists
                const userExists = await User.findOne({
                    email: profile.email
                });
                // If not, create a new user
                if (!userExists) {
                    await User.create({
                        email: profile.email,
                        username: profile.name.replace(" ", "").toLowerCase(),
                        image: profile.picture
                    });
                }
                return true; // Sign-in successful
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false; // Sign-in failed
            }
        }
    }
});

export { handler as GET, handler as POST };
