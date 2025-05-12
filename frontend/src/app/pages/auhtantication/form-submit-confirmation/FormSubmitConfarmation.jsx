'use client'
import React from 'react';
import { FaCheckCircle, FaRedo } from 'react-icons/fa';
import { FcViewDetails } from "react-icons/fc";
import Link from 'next/link';

const FormSubmitConfirmation = ({ onNewSubmission, _id }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="form-bg   rounded-lg  p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-4">
                    <FaCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Response submitted</h2>
                <p className="text-gray-600 mb-6">
                    Your response has been recorded successfully. Thank you for your submission!
                </p>
                
                <div className="flex flex-col space-y-3">
                    <Link 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            onNewSubmission();
                        }}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white   btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                            <FaRedo className="mr-2" />
                        Submit another response
                    </Link>
                    <Link 
                        href={`/view-single-response/${_id}`} 
                        
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >

<FcViewDetails className="mr-2" />
                    
                      View Response
                    </Link>
                    
                    
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Responses are collected anonymously unless you provided contact information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FormSubmitConfirmation;