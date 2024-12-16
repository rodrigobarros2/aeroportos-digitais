import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = ["email1@example.com", "rodrigobarrosmax@gmail.com"];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (allowedEmails.includes(user.email as string)) {
        return true;
      }
      return false;
    },
  },
  pages: {
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
