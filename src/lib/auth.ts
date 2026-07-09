import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );
          const response = await res.json();

          console.log("Login response:", response);

          if (!res.ok || !response?.success) {
            throw new Error(response?.message || "Login failed");
          }

          const payload = response?.data ?? response;
          const user = payload?.user;
          const accessToken = payload?.accessToken ?? payload?.token;

          if (!user || !accessToken) {
            throw new Error(response?.message || "Invalid login response");
          }

          return {
            id: user?._id ?? user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            email: user?.email,
            phoneNumber: user?.phoneNumber,
            status: user?.status,
            tag: user?.tag,
            gender: user?.gender,
            role: user?.role,
            profileImage: user?.profileImage,
            token: accessToken,
            accessToken,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Authentication failed. Please try again.";
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id ?? user._id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
        token.email = user.email;
        token.status = user.status;
        token.tag = user.tag;
        token.phoneNumber = user.phoneNumber;
        token.role = user.role;
        token.profileImage = user.profileImage;
        token.token = user.token ?? user.accessToken;
        token.accessToken = user.token ?? user.accessToken;
      }
      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: JWT }) {
      session.user = {
        id: token.id,
        firstName: token.firstName,
        lastName: token.lastName,
        username: token.username,
        tag: token.tag,
        status: token.status,
        email: token.email,
        phoneNumber: token.phoneNumber,
        role: token.role,
        profileImage: token.profileImage,
        token: token.token ?? token.accessToken,
        accessToken: token.accessToken ?? token.token,
      };
      return session;
    },
  },
};