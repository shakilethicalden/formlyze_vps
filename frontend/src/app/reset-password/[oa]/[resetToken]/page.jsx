'use client'
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleCheck, FaEye, FaEyeSlash } from "react-icons/fa6";
import bg from "@/assets/images/auth/bg-1.png";
import bg2 from "@/assets/images/auth/bg-2.png";
import logo from "@/assets/images/logo/formlazy logo.png";
import Link from "next/link";
import usePublicAxios from "@/hooks/usePublicAxios";
import { toast, ToastContainer } from "react-toastify";


const ResetPasswordPage = () => {
  const params = useParams();
  const router = useRouter();
  const publicAxios = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  // Extract oa and reset-token from params
  const { oa, resetToken } = params;
  console.log("OA:", oa);
  console.log("Reset Token:", resetToken);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Basic validation
    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const passwords = {
        
      password: passwordData.password,
      confirm_password: passwordData.confirmPassword,
   
    }

try {
    const resp = await publicAxios.post(`/users/reset-password/${oa}/${resetToken}/`, passwords);
    console.log(resp.data); 
    setLoading(false);
    if(resp.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setLoading(false);

      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }

    
} catch (error) {
    toast.error(error.message)
    setLoading(false)
    
}

    // try {
    //   // Log the data to console as requested
    //   console.log("Submitting:", {
    //     password: passwordData.password,
    //     confirmPassword: passwordData.confirmPassword,
    //     oa,
    //     resetToken
    //   });


      

    //   // In a real implementation, you would make an API call here:
    //   // const response = await publicAxios.post(`/${oa}/reset-password/${resetToken}`, {
    //   //   password: passwordData.password,
    //   //   confirmPassword: passwordData.confirmPassword
    //   // });
      
    //   // For now, just simulate success
    //   setSuccessMessage("Password reset successfully! Redirecting to login...");
      
    //   // Redirect after 3 seconds
    //   setTimeout(() => {
    //     router.push("/sign-in");
    //   }, 3000);

    // } catch (err) {
    //   console.error("Reset password error:", err);
    //   setError("Failed to reset password. Please try again.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="h-full w-full mr-auto px-8 overflow-hidden relative bg-white no-scrollbar">
      <div className="mt-28 overflow-y-hidden">
        <ToastContainer/>
        <div>
          <Link href={'/'} className="cursor-pointer">
            <Image src={logo} alt="logo" height={180} width={180} className="absolute top-4 " />
          </Link>
          <Image alt="bg" src={bg} className="absolute top-0 right-0 h-[60%]" />
          <Image alt="bg" src={bg2} className="absolute -left-32 -bottom-56 h-[60%]" />
        </div>

        <div className="rounded-xl bg-[#F1F1F1] mx-auto p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">Reset Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="text-gray-600 block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword.password ? "text" : "password"}
                  name="password"
                  value={passwordData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full text-black p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-gray-600 block mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full text-black p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-auth text-white font-bold rounded-lg cursor-pointer hover:opacity-90 transition disabled:opacity-70"
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-gray-700 mt-6">
            Remember your password? <Link href="/sign-in" className="text-purple-900 font-bold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;