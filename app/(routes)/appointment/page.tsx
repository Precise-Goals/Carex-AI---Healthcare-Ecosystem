'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CheckCircle, AlertCircle, Loader2, Upload, X, FileText, FileImage } from 'lucide-react';

interface FormData {
  name: string;
  age: string;
  contact: string;
  email: string;
  address: string;
  pin: string;
}

export default function AppointmentForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    contact: '',
    email: '',
    address: '',
    pin: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum size is 10MB.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formData.name || !formData.age || !formData.contact || !formData.email || !formData.address || !formData.pin) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!file) {
      setError('Please upload a medical report.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create FormData object with all form values and file
      const submitData = new FormData();
      
      // Append all form field values
      submitData.append('name', formData.name);
      submitData.append('age', formData.age);
      submitData.append('contact', formData.contact);
      submitData.append('email', formData.email);
      submitData.append('address', formData.address);
      submitData.append('pin', formData.pin);
      
      // Append the selected file
      submitData.append('file', file);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setError(null);
      } else {
        setError(result.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Thank you, your details and report analysis have been submitted.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                age: '',
                contact: '',
                email: '',
                address: '',
                pin: ''
              });
              setFile(null);
              setError(null);
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
      
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Book an Appointment</h1>
            <p className="text-blue-100 mt-2">Fill out the form below to schedule your appointment</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your contact number"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code *
                </label>
                <input
                  type="text"
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your pin code"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Medical Report *
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload your blood test report or medical document (PDF, JPG, PNG)
              </p>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                
                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <FileImage className="w-12 h-12 text-green-500" />
                      ) : (
                        <FileText className="w-12 h-12 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">
                      {isDragActive ? 'Drop the file here...' : 'Drag & drop your medical report here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to select a file (PDF, JPG, PNG)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Your Request</h3>
                <p className="text-gray-600">
                  Please wait while we process your appointment request...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Appointment Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}