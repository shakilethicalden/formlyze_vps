import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Helper function to format user data consistently
const formatUserData = (userData, id, token) => ({
  user: {
    id: id,
    email: userData.email || '',
    username: userData.username || '',
    phone: userData.phone || '',
    address: userData.address || '',
    healthCareName: userData.healthCareName || '',
    token: token
  },
  token: token
});

// Fetch user info with token authentication
const fetchUserWithToken = async (id, token) => {
  try {
    const response = await axios.get(
      `http://168.231.68.138/api/users/list/${id}/`,
      {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response?.data) {
      throw new Error("Invalid user data response");
    }

    return formatUserData(response.data, id, token);
  } catch (error) {
    console.error("User fetch error:", error);
    throw new Error(JSON.stringify({
      error: "Failed to fetch user information",
      status: error.response?.status || 500,
      details: error.message
    }));
  }
};

// Handle username/password authentication
const handleCredentialsAuth = async (username, password) => {
  try {
    const loginResponse = await axios.post(
      'http://168.231.68.138/api/users/login/',
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!loginResponse?.data?.token || !loginResponse?.data?.user_id) {
      throw new Error("Invalid login response");
    }

    const { token, user_id } = loginResponse.data;
    return await fetchUserWithToken(user_id, token);

  } catch (error) {
    console.error("Login error:", error);
    throw new Error(JSON.stringify({
      error: "Authentication failed",
      status: error.response?.status || 401,
      details: error.message
    }));
  }
};

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET || 'your-secure-fallback-secret',

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        user_id: { type: "text" },
        token: { type: "text" }
      },

      async authorize(credentials) {
        try {
          // Handle Google OAuth token authentication
          if (credentials?.user_id && credentials?.token) {
            const { user, token } = await fetchUserWithToken(credentials.user_id, credentials.token);
            return { ...user, token };
          }

          // Handle regular username/password authentication
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Username and password are required");
          }

          const { user, token } = await handleCredentialsAuth(credentials.username, credentials.password);
          return { ...user, token };

        } catch (error) {
          console.error("Authorization error:", error);
          let errorData = { error: "Login failed", status: 401 };
          
          try {
            errorData = JSON.parse(error.message);
          } catch (e) {
            errorData.details = error.message;
          }
          
          throw new Error(JSON.stringify(errorData));
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          address: user.address,
          healthCareName: user.healthCareName,
          token: user.token
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    }
  },

  pages: {
    signIn: '/sign-in',
    error: '/sign-in?error='
  },

  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };