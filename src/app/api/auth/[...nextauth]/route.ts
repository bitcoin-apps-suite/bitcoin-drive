import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email", 
            "profile",
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/documents",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://mail.google.com/",
            "https://www.googleapis.com/auth/gmail.compose",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/youtube",
            "https://www.googleapis.com/auth/youtube.upload"
          ].join(" ")
        }
      }
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).accessToken = token.accessToken;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).refreshToken = token.refreshToken
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }