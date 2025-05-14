import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials Provider for Email/Password Authentication
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password.");
        }

        // Remove the verification check
        // We'll consider all users as verified after signup

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          provider: 'credentials',
          isVerified: true // Always set to true
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      await dbConnect();

      // For Google OAuth users
      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = new User({
            name: user.name,
            email: user.email,
            isVerified: true, // Google users are automatically verified
          });
          await newUser.save();
          // Use the MongoDB ID for the new user
          token.id = newUser._id.toString();
        } else {
          // Use the MongoDB ID for existing user
          token.id = existingUser._id.toString();
        }
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = "google";
        token.isVerified = true; // Google users are automatically verified
      }

      // For non-Google users (CredentialsProvider)
      if (user && !account?.provider) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.provider = user.provider || "credentials";
        token.isVerified = true; // All users are considered verified
      }

      return token;
    },
    async session({ session, token }) {
      // Ensure user ID is properly set
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.picture = token.picture; // Only defined for Google users
      session.user.provider = token.provider;
      session.user.isVerified = token.isVerified;
      
      // Add debugging to help troubleshoot
      console.log("Session user ID:", session.user.id);
      console.log("Session user provider:", session.user.provider);
      
      return session;
    },
  },
};

export default NextAuth(authOptions);
