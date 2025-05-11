'use client';
import ErrorPage from '@/components/shared/ErrorPage';
import LoadingPage from '@/components/shared/Loader';
import usePublicAxios from '@/hooks/usePublicAxios';
import React, { useEffect, useState } from 'react';
import {
  FaChevronDown,
  FaCalendarAlt,
  FaClock,
  FaHashtag,
  FaEnvelope,
  FaSignature,
  FaLink,
  FaPhone,
} from 'react-icons/fa';
import { FiImage } from 'react-icons/fi';
import FormSubmitConfirmation from '../auhtantication/form-submit-confirmation/FormSubmitConfarmation';
import { toast, ToastContainer } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/shared/Navbar';
import logo from '@/assets/images/logo/formlazy logo.png'; // Default logo
import dummyLogo from '@/assets/images/logo/formlazy logo.png';  // Dummy logo for when data.logo is not available
import Link from 'next/link';
import bg from '@/assets/images/auth/bg-1.png';
import bg2 from '@/assets/images/auth/bg-2.png';
import Image from 'next/image';

const ViewForm = ({ data, isLoading, error, id }) => {


  const session = useSession();
  const user = session?.data?.user;
  const [_id, setId] = useState(null);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState('');
  const [filledFields, setFilledFields] = useState({});
  const publicAxios = usePublicAxios();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const countryCodes = [
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+91', name: 'India' },
    { code: '+880', name: 'Bangladesh' },
    { code: '+86', name: 'China' },
    { code: '+81', name: 'Japan' },
    { code: '+33', name: 'France' },
    { code: '+49', name: 'Germany' },
    { code: '+7', name: 'Russia' },
    { code: '+61', name: 'Australia' },
    { code: '+971', name: 'UAE' },
  ];

  if (isSubmitted) {
    return <FormSubmitConfirmation onNewSubmission={() => setIsSubmitted(false)} _id={_id} />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage message="Something went wrong. Please try again later." />;
  }

  if (!data) {
    return <div className="ml-[25%] mt-28 text-gray-500">No form data available</div>;
  }

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    if (value && value !== '') {
      setFilledFields((prev) => ({
        ...prev,
        [fieldId]: true,
      }));
    } else {
      setFilledFields((prev) => ({
        ...prev,
        [fieldId]: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submissionFormData = new FormData();
    submissionFormData.append('responder_email', email);
    submissionFormData.append('form', data.id);
    submissionFormData.append('title', data.form_name || data.title || '');

    const responseData = data.fields.map((field) => {
      let responseValue = '';

      if (field.type === 'file' || field.type === 'signature') {
        const file = formData[field.id];
        if (file) {
          submissionFormData.append(`file_${field.id}`, file);
          responseValue = file.name;
        }
      } else if (field.type === 'phone' && formData[field.id] && formData[field.id].code && formData[field.id].number) {
        responseValue = `${formData[field.id].code}${formData[field.id].number}`;
      } else {
        responseValue = formData[field.id] || '';
      }

      return {
        field_id: field.id,
        field_type: field.type,
        question_title: field.heading || 'Untitled Question',
        response: responseValue,
      };
    });

    submissionFormData.append('response_data', JSON.stringify(responseData));

    try {
      const resp = await publicAxios.post('/form/response/', submissionFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (resp.status === 201) {
        toast.success('Response sent successfully');
        setIsSubmitted(true);
        setId(resp.data.id);
      }
    } catch (err) {
      toast.error('Failed to submit response. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, index) => {
    const isFilled = filledFields[field.id] || false;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
              isFilled ? 'border-[#1A1466]' : ''
            }`}
            placeholder="Your answer"
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <textarea
            className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
              isFilled ? 'border-[#1A1466]' : ''
            }`}
            placeholder="Your answer"
            rows={4}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );
      case 'radio':
        return (
          <div className="space-y-3 mt-2">
            {field.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <label className="flex items-center cursor-pointer w-full">
                  <input
                    type="radio"
                    name={`radio-${field.id}`}
                    className="h-5 w-5 border-[#CCCAEC] text-[#1A1466] focus:ring-[#1A1466]"
                    value={option}
                    onChange={() => handleInputChange(field.id, option)}
                  />
                  <span className="ml-3 text-gray-800">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-3 mt-2">
            {field.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <label className="flex items-center cursor-pointer w-full">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#CCCAEC] text-[#1A1466] focus:ring-[#1A1466]"
                    value={option}
                    onChange={(e) => {
                      const currentValues = Array.isArray(formData[field.id]) ? formData[field.id] : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option);
                      handleInputChange(field.id, newValues);
                    }}
                  />
                  <span className="ml-3 text-gray-800">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <div className="relative mt-2">
            <select
              className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] appearance-none ${
                isFilled ? 'border-[#1A1466]' : ''
              }`}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {field.options.map((option, optIndex) => (
                <option key={optIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'date':
        return (
          <div className="relative mt-2">
            <input
              type="date"
              className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
                isFilled ? 'border-[#1A1466]' : ''
              }`}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            <FaCalendarAlt className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'time':
        return (
          <div className="relative mt-2">
            <input
              type="time"
              className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
                isFilled ? 'border-[#1A1466]' : ''
              }`}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            <FaClock className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'file':
        return (
          <div className="mt-4 border-2 border-dashed border-[#CCCAEC] rounded-lg p-6 text-center bg-[#F4F4FF]">
            <div className="flex flex-col items-center justify-center">
              <FiImage className="text-gray-400 text-3xl mb-2" />
              {formData[field.id] ? (
                <>
                  <p className="text-gray-800 font-medium">{formData[field.id].name}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                    onClick={() => handleInputChange(field.id, null)}
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500">Drag and drop files here or click to upload</p>
                  <input
                    type="file"
                    className="hidden"
                    id={`file-${field.id}`}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleInputChange(field.id, file);
                      }
                    }}
                  />
                  <label
                    htmlFor={`file-${field.id}`}
                    className="mt-4 px-4 py-2 bg-white text-[#1A1466] border border-[#CCCAEC] rounded-md hover:bg-[#E9E9FD] cursor-pointer"
                  >
                    Select files
                  </label>
                </>
              )}
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="relative mt-2">
            <input
              type="email"
              className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
                isFilled ? 'border-[#1A1466]' : ''
              }`}
              placeholder="email@example.com"
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            <FaEnvelope className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'number':
        return (
          <div className="relative mt-2">
            <input
              type="number"
              className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
                isFilled ? 'border-[#1A1466]' : ''
              }`}
              placeholder="123"
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            <FaHashtag className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'phone':
        return (
          <div className="mt-2 flex items-center space-x-4">
            <div className="relative w-1/3">
              <select
                className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] appearance-none ${
                  isFilled ? 'border-[#1A1466]' : ''
                }`}
                onChange={(e) => {
                  const phoneData = formData[field.id] || { code: '', number: '' };
                  phoneData.code = e.target.value;
                  handleInputChange(field.id, phoneData);
                }}
              >
                <option value="">Code</option>
                {countryCodes.map((country, idx) => (
                  <option key={idx} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <input
                type="tel"
                className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
                  isFilled ? 'border-[#1A1466]' : ''
                }`}
                placeholder="Phone number"
                onChange={(e) => {
                  const phoneData = formData[field.id] || { code: '', number: '' };
                  phoneData.number = e.target.value;
                  handleInputChange(field.id, phoneData);
                }}
              />
              <FaPhone className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F4F4FF] p-5 rounded-lg border border-[#CCCAEC]">
            {field.addressFields?.map((addrField, addrIndex) => (
              <div key={addrIndex} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {addrField.label}
                  {addrField.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  className="w-full border border-[#CCCAEC] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A1466] text-gray-800"
                  placeholder={`Enter ${addrField.label.toLowerCase()}`}
                  onChange={(e) => {
                    const addressData = formData[field.id] || {};
                    addressData[addrField.label] = e.target.value;
                    handleInputChange(field.id, addressData);
                  }}
                />
              </div>
            ))}
          </div>
        );
      case 'signature':
        return (
          <div className="mt-4 border-2 border-dashed border-[#CCCAEC] rounded-lg p-6 text-center bg-[#F4F4FF]">
            <div className="flex flex-col items-center justify-center">
              <FaSignature className="text-gray-400 text-4xl mb-3" />
              {formData[field.id] ? (
                <>
                  <p className="text-gray-800 font-medium">{formData[field.id].name}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                    onClick={() => handleInputChange(field.id, null)}
                  >
                    Remove signature
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500">Upload your signature</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`signature-${field.id}`}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleInputChange(field.id, file);
                      }
                    }}
                  />
                  <label
                    htmlFor={`signature-${field.id}`}
                    className="mt-3 text-sm bg-white px-3 py-1.5 rounded-lg border border-[#CCCAEC] text-[#1A1466] hover:bg-[#E9E9FD] cursor-pointer"
                  >
                    Upload Signature
                  </label>
                </>
              )}
            </div>
          </div>
        );
      case 'url':
        return (
          <div className="relative mt-2">
            <input
              type="url"
              className={`w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-[#F4F4FF] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466] ${
                isFilled ? 'border-[#1A1466]' : ''
              }`}
              placeholder="https://example.com"
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            <FaLink className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
          </div>
        );
      default:
        return null;
    }
  };


  // Determine logo and website URL to use
  const displayLogo = data.logo ? data.logo : dummyLogo;
  const displayWebsiteUrl = data.url ? data.url : 'https://example.com';

  return (
    <div className="min-h-screen px-4 md:px-8">
      <div className="mt-28 rounded-2xl overflow-hidden border-[#1A1466] border mb-8 bg-white mx-auto">
        <ToastContainer />
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#0e0e11] to-[#8886CD] px-4 md:px-6 py-5">
          {/* Logo and Website URL Section */}
          <div className="flex justify-between items-center mb-4">
         { data?.logo &&  <Link href="/">
              <Image
                src={`https://formlyze.mrshakil.com${displayLogo}`}
                alt="Form Logo"
                width={100}
                height={50}
                className="object-contain rounded-sm shadow-sm p-2 bg-white"
              />
            </Link>}
           {
           data.url && <a
              href={displayWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm font-medium hover:underline flex items-center bg-[#1A1466] px-3 py-1.5 rounded-md shadow-sm hover:bg-opacity-90 transition-colors"
            >
              <FaLink className="mr-2" />
              {displayWebsiteUrl}
            </a>}
          </div>
          {/* Form Title and Description */}
          <h1 className="text-2xl font-semibold text-white">
            {data.title || data.form_name || 'Untitled Form'}
          </h1>
          <p className="text-sm text-[#CCCAEC] mt-1">
            {data.description || data.form_description || 'Please fill out the form below.'}
          </p>
          {data.fields?.some((field) => field.required) && (
            <p className="text-xs text-[#CCCAEC] mt-2">
              * Indicates required question
            </p>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-3 md:px-6 py-5">
          {/* Email Field */}
          <div className="mb-6 bg-[#F4F4FF] p-5 rounded-lg border border-[#CCCAEC]">
            <h2 className="text-lg font-semibold text-[#1A1466]">
              Your Email Address <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              We'll use this to contact you if needed
            </p>
            <div className="relative mt-3">
              <input
                type="email"
                className="w-full border border-[#CCCAEC] rounded-lg px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A1466]"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {data.fields?.map((field, index) => (
              <div key={index} className="bg-[#F4F4FF] p-5 rounded-lg border border-[#CCCAEC]">
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-[#1A1466]">
                    {field.heading || 'Untitled Question'}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </h2>
                  {field.description && (
                    <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                  )}
                </div>
                {renderField(field, index)}
              </div>
            ))}
          </div>

          {/* Form Footer */}
          <div className="mt-8 flex justify-between items-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-[#1A1466] text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1A1466] focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <p className="text-sm ml-8 sm:ml-0 text-gray-500">All responses will be kept confidential</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewForm;