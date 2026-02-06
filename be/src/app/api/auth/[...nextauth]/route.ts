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
        // Dùng NEXTAUTH_URL thay vì NEXT_PUBLIC_API_URL
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const url = `${baseUrl}/api/check-access?email=${encodeURIComponent(user.email)}`;

        console.log("Checking access for:", user.email);
        console.log("API URL:", url);

        const response = await fetch(url);

        if (!response.ok) {
          console.error(`API returned status ${response.status}`);
          return false;
        }

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