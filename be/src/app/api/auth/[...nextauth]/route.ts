import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-access?email=${user.email}`);
        const data = await response.json();
        console.log("Auth server response:", data);
        return data.allowed === true;
      } catch (error) {
        console.error("Auth server connection error:", error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };