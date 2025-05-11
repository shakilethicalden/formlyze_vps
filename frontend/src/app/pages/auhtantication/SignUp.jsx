'use client'
import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { FaRegCircle } from "react-icons/fa6";
import Image from "next/image";
import bg from "@/assets/images/auth/bg-1.png";
import bg2 from "@/assets/images/auth/bg-2.png";
import logo from "@/assets/images/logo/formlazy logo.png";
import usePublicAxios from "@/hooks/usePublicAxios";
import { toast, ToastContainer } from "react-toastify";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { signIn } from "next-auth/react";

const SignUp = () => {


  const tokenId = ()=>{

    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const user_id = searchParams.get('user_id');
const params = {token, user_id};
return params;
  
  }



  const saveGoogleinfo = async ()=>{
    if(user_id){
  
      const res = await signIn("credentials", {
         user_id: params.user_id,
         token:params.token
         });
    }
  }
  

  const publicAxios = usePublicAxios();
  const googleLogin= async ()=>{
    const response =await publicAxios.get('/google/oauth/config/');

    const googleClientId = response.data.google_client_id;
    const googleCallbackUri = response.data.google_callback_uri; 

    console.log(googleCallbackUri, googleClientId);

    if(googleCallbackUri, googleClientId){
      redirect(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${googleCallbackUri}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline`)
    }
    console.log(googleCallbackUri, googleClientId);

  
    
// https://formlyze.mrshakil.com/api/v1/auth/google/callback/?code=4%2F0Ab_5qlmxErtmY4i2GzFCG4-K6KGhzpWfIS5yeHwVW5pHGCLUrBuqWcgB42_2niKVIKddtw&scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=0&prompt=consent
  }

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    healthCareName: "",
    address: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        else if (value.length > 100) error = "Username must be ≤100 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        else if (value.length > 254) error = "Email must be ≤254 characters";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be ≥8 characters";
        break;
      case "phone":
        if (!value.trim()) error = "Phone is required";
        else if (!/^[0-9+]+$/.test(value)) error = "Only numbers and + allowed";
        else if (value.length > 15) error = "Phone must be ≤15 characters";
        break;
      case "healthCareName":
        if (value.length > 100) error = "Healthcare name must be ≤100 characters";
        break;
      case "address":
        if (value.length > 200) error = "Address must be ≤200 characters";
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
    setApiError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const registarPost = async (userData) => {
    try {
      const apiData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        healthCareName: userData.healthCareName || null,
        address: userData.address || null,
        phone: userData.phone
      };

      const response = await publicAxios.post('users/register/', apiData);

      if(response.data.success === true){
        toast.success('Registration success')
        setTimeout(() => {
          router.push('/sign-in')
        }, 300);
      }
      return response.data;
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      
      let errorMessage = "Registration failed. Please try again.";
      if (error.response?.data) {
        errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
      }
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    
    const newTouched = {};
    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(newTouched);
    
    const newErrors = {};
    Object.entries(formData).forEach(([name, value]) => {
      newErrors[name] = validateField(name, value);
    });
    setErrors(newErrors);
    
    if (Object.values(newErrors).every(error => !error)) {
      try {
        const result = await registarPost(formData);
        console.log("Registration successful:", result);
       
        setFormData({
          username: "",
          email: "",
          password: "",
          healthCareName: "",
          address: "",
          phone: ""
        });
      } catch (error) {
        setApiError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    return `w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
      errors[fieldName] && touched[fieldName]
        ? "border-red-500 focus:ring-red-500"
        : "border-purple-300 focus:ring-purple-500"
    } text-[#000000] relative`;
  };

  const getValidationIcon = (fieldName) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) {
      return <FaRegCircle className="h-5 w-5 text-gray-400 absolute right-3 top-12" />;
    }
    return <FaCircleCheck className="h-5 w-5 text-green-500 absolute right-3 top-12" />;
  };

  return (
    <div className=" mb-24 overflow-hidden relative">
      <div className="flex mb-24  justify-center lg:mt-32 xl:mt-44">
        <Link href={'/'} className="cursor-pointer ">
        
        <Image src={logo} alt="logo" height={180} width={180} className="absolute top-4 left-4" />
        </Link>
        <Image alt="bg" src={bg} className="absolute top-0 -right-32 overflow-auto h-[60%]" />
        <Image alt="bg" src={bg2} className="absolute -left-[30%] bottom-0 h-[60%]" />

        <div className="rounded-xl bg-[#F1F1F1] p-8 max-w-[550px] w-full h-full">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">Sign up</h2>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg">
              {apiError}
            </div>
          )}

          <div className="flex justify-between mb-6">
            <button 
             onClick={googleLogin}
              type="button"
              className="flex items-center cursor-pointer justify-center gap-2 text-[#000000] bg-[#E4E4E4] py-2 px-4 rounded-lg w-full"
            >
              <FaGoogle /> Use a Google account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <h4 className="text-gray-500 mb-2">Username*</h4>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("username")}
              />
              {getValidationIcon("username")}
              {errors.username && touched.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
            <ToastContainer/>

            {/* Email */}
            <div className="relative">
              <h4 className="text-gray-500 mb-2">Email*</h4>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("email")}
              />
              {getValidationIcon("email")}
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <h4 className="text-gray-500 mb-2">Password*</h4>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("password")}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-12 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {getValidationIcon("password")}
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Healthcare Name */}
            <div className="relative">
              <h4 className="text-gray-500 mb-2">Healthcare Name (optional)</h4>
              <input
                type="text"
                name="healthCareName"
                value={formData.healthCareName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("healthCareName")}
              />
              {getValidationIcon("healthCareName")}
              {errors.healthCareName && touched.healthCareName && (
                <p className="text-red-500 text-sm mt-1">{errors.healthCareName}</p>
              )}
            </div>

            {/* Address */}
            <div className="relative">
              <h4 className="text-gray-500 mb-2">Address (optional)</h4>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("address")}
              />
              {getValidationIcon("address")}
              {errors.address && touched.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
              <h4 className="text-gray-500 mb-2">Phone*</h4>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("phone")}
              />
              {getValidationIcon("phone")}
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full cursor-pointer py-3 bg-gradient-to-r btn-auth text-white font-bold rounded-lg transition mt-6 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-gray-700 mt-6">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-purple-900 font-bold">
              Sign in Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;