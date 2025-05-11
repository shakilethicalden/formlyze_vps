'use client'
import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";
import bg from "@/assets/images/auth/bg-1.png";
import bg2 from "@/assets/images/auth/bg-2.png";
import logo from "@/assets/images/logo/formlazy logo.png";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import usePublicAxios from "@/hooks/usePublicAxios";
import Modal from "./Modal";


const SignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    emailOrUsername: "",
    password: ""
  });
  const publicAxios = usePublicAxios();
  const [error, setError] = useState("");
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [loader, setLoader] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const googleLogin = async () => {
    const response = await publicAxios.get('/google/oauth/config/');
    const googleClientId = response.data.google_client_id;
    const googleCallbackUri = response.data.google_callback_uri; 

    if(googleCallbackUri && googleClientId){
      redirect(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${googleCallbackUri}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline`)
    }
  };

  const handleForgotPassword = async (e) => {
    setLoader(true)
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordMessage("");

    try {
      const resp = await publicAxios.post('/users/forgot-password/', { email: forgotPasswordEmail });
      console.log(resp.data); // Log the response to console
      setLoader(false)
      
      if (resp.data.success) {
        setForgotPasswordMessage("Password reset mail sent to your email. Please check your inbox.");
        setForgotPasswordEmail("");
        setLoader(false)
      } else {
        setForgotPasswordError("Failed to send reset email. Please try again.");
        setLoader(false)
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setLoader(false)
      setForgotPasswordError("An error occurred. Please try again.");
    }
  };

  const session = useSession();
  console.log(session, 'session');

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      username: credentials.emailOrUsername,
      password: credentials.password,
      redirect: false,
    });

    if(res){
      setLoading(false)
    }

    if (res?.error) {
      try {
        const errorObj = JSON.parse(res.error);
        setError(errorObj.error || "Login failed.");
        setLoading(false)
      } catch {
        setError("Login failed.");
      }
    } else {
      router.push("/"); 
    }
  };

  return (
    <div className="h-full overflow-hidden relative bg-white no-scrollbar">
      <div className="mt-28 overflow-y-hidden flex justify-center items-center">
        <div>
          <Link href={'/'} className="cursor-pointer">
            <Image src={logo} alt="logo" height={180} width={180} className="absolute top-4 left-4" />
          </Link>
          <Image alt="bg" src={bg} className="absolute top-0 right-0 h-[60%]" />
          <Image alt="bg" src={bg2} className="absolute -left-32 -bottom-56 h-[60%]" />
        </div>

        <div className="rounded-xl bg-[#F1F1F1] p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="text-gray-600 block mb-1"> Username</label>
              <input
                type="text"
                name="emailOrUsername"
                value={credentials.emailOrUsername}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full text-black p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaCircleCheck className="h-5 w-5 text-gray-400 absolute right-3 top-11" />
            </div>

            <div className="relative">
              <label className="text-gray-600 block mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-black p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaCircleCheck className="h-5 w-5 text-gray-400 absolute right-3 top-11" />
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setForgotPasswordModal(true)}
                className="text-purple-900 text-sm hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 btn-auth text-white font-bold rounded-lg cursor-pointer hover:opacity-90 transition"
            >
              {loading ? "Loading..." : "Sign in"}
            </button>

            <button 
              onClick={googleLogin}
              type="button"
              className="flex items-center justify-center cursor-pointer gap-2 text-[#000000] bg-[#E4E4E4] py-2 px-4 rounded-lg w-full"
            >
              <FaGoogle /> Use a Google account
            </button>
          </form>

          <p className="text-center text-gray-700 mt-6">
            Don't have an account? <Link href="/sign-up" className="text-purple-900 font-bold">Sign up Now</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <Modal onClose={() => {
          setForgotPasswordModal(false);
          setForgotPasswordMessage("");
          setForgotPasswordError("");
        }}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold text-purple-900 mb-4 cursor-pointer">Forgot Password</h3>
            
            {forgotPasswordMessage ? (
              <div className="text-green-600 mb-4">{forgotPasswordMessage}</div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full text-black p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                {forgotPasswordError && <p className="text-red-500 text-sm mb-4">{forgotPasswordError}</p>}
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordModal(false);
                      setForgotPasswordMessage("");
                      setForgotPasswordError("");
                    }}
                    className="px-4 py-2 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 cursor-pointer bg-purple-900 text-white rounded-lg hover:bg-purple-800"
                  >
                 {loader ? "Loading..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SignIn;