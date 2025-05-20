'use client'
import { Suspense } from 'react'
import React, { useState, useRef, useEffect } from 'react'
import { FiPlus, FiTrash2, FiEdit2, FiChevronDown, FiX, FiImage, FiUpload } from 'react-icons/fi'
import { 
  FaRegCircle, 
  FaRegCheckSquare, 
  FaChevronDown as FaDropdown,
  FaCalendarAlt,
  FaClock,
  FaHashtag,
  FaEnvelope,
  FaAlignLeft,
  FaFont,
  FaGlobe,
  FaSignature,
  FaLink
} from 'react-icons/fa'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import usePublicAxios from '@/hooks/usePublicAxios'
import { toast, ToastContainer } from 'react-toastify'
import useGetForm from '@/hooks/form/useGetForm'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { template } from '@/data/template/template'

function FormEditorContent() {
  const session = useSession()
  const publicAxios = usePublicAxios()
  const { refetch } = useGetForm()
  const user_id = session?.data?.user?.id
  const [loading, setLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const id = idParam ? parseInt(idParam) : null

  const templateForm = template
  const dataForm = templateForm.find(data => data.id === id)

  const [form, setForm] = useState({
    title: '',
    created_by: user_id,
    description: '',
    logo: null,
    website_url: '',
    fields: []
  })

  // Initialize form with template data if ID exists
  useEffect(() => {
    if (id && dataForm) {
      setForm({
        title: dataForm.title,
        created_by: user_id,
        description: dataForm.description,
        logo: dataForm.logo || null,
        website_url: dataForm.website_url || '',
        fields: dataForm.fields.map(field => ({
          id: field.id || Date.now(),
          heading: field.heading,
          type: field.type,
          description: field.description || '',
          options: field.options || [],
          required: field.required || false,
          addressFields: field.addressFields || []
        }))
      })
    }
  }, [id, dataForm, user_id])

  const [editingFieldIndex, setEditingFieldIndex] = useState(null)
  const [newOptionText, setNewOptionText] = useState('')
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [currentSelectIndex, setCurrentSelectIndex] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const fileInputRef = useRef(null)
  const fieldRefs = useRef([])

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
  ]

  const getDefaultHeading = (type) => {
    const headings = {
      text: 'Enter your answer',
      textarea: 'Enter your response',
      radio: 'Choose one option',
      checkbox: 'Select all that apply',
      dropdown: 'Select an option',
      date: 'Select date',
      time: 'Select time',
      file: 'Upload your file',
      number: 'Enter a number',
      email: 'Enter your email',
      address: 'Enter your address',
      phone: 'Enter your phone number',
      signature: 'Provide your signature',
      url: 'Enter website URL'
    }
    return headings[type] || 'Untitled Question'
  }

  const addNewField = () => {
    const newField = {
      id: Date.now(),
      heading: 'Untitled Question',
      type: 'text',
      description: '',
      options: [],
      required: false,
      addressFields: []
    }
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
    const newIndex = form.fields.length
    setEditingFieldIndex(newIndex)
  }

  useEffect(() => {
    if (editingFieldIndex !== null && fieldRefs.current[editingFieldIndex]) {
      fieldRefs.current[editingFieldIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [editingFieldIndex, form.fields.length])

  const updateField = (index, updatedField) => {
    const updatedFields = [...form.fields]
    updatedFields[index] = updatedField
    setForm(prev => ({
      ...prev,
      fields: updatedFields
    }))
  }

  const deleteField = (index) => {
    const updatedFields = form.fields.filter((_, i) => i !== index)
    setForm(prev => ({
      ...prev,
      fields: updatedFields
    }))
    if (editingFieldIndex === index) {
      setEditingFieldIndex(null)
    } else if (editingFieldIndex > index) {
      setEditingFieldIndex(editingFieldIndex - 1)
    }
  }

  const addOption = (fieldIndex) => {
    if (!newOptionText.trim()) return
    
    const updatedField = { ...form.fields[fieldIndex] }
    updatedField.options = [...updatedField.options, newOptionText]
    updateField(fieldIndex, updatedField)
    setNewOptionText('')
  }

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedField = { ...form.fields[fieldIndex] }
    updatedField.options = updatedField.options.filter((_, i) => i !== optionIndex)
    updateField(fieldIndex, updatedField)
  }

  const updateOption = (fieldIndex, optionIndex, value) => {
    const updatedField = { ...form.fields[fieldIndex] }
    updatedField.options[optionIndex] = value
    updateField(fieldIndex, updatedField)
  }

  const getDefaultAddressFields = () => {
    return [
      { id: Date.now() + 1, label: 'Street Address', required: true, value: '' },
      { id: Date.now() + 2, label: 'Street Address Line 2', required: false, value: '' },
      { id: Date.now() + 3, label: 'City', required: true, value: '' },
      { id: Date.now() + 4, label: 'State/Province', required: true, value: '' },
      { id: Date.now() + 5, label: 'Postal/Zip Code', required: true, value: '' },
      { id: Date.now() + 6, label: 'Country', required: true, value: '' }
    ]
  }

  const updateAddressField = (fieldIndex, addressFieldIndex, key, value) => {
    const updatedField = { ...form.fields[fieldIndex] }
    updatedField.addressFields[addressFieldIndex][key] = value
    updateField(fieldIndex, updatedField)
  }

  const removeAddressField = (fieldIndex, addressFieldIndex) => {
    const updatedField = { ...form.fields[fieldIndex] }
    updatedField.addressFields.splice(addressFieldIndex, 1)
    updateField(fieldIndex, updatedField)
  }

  const router = useRouter()

  const addCustomAddressField = (fieldIndex) => {
    const newField = {
      id: Date.now(),
      label: 'New Field',
      required: false,
      value: ''
    }
    const updatedField = { ...form.fields[fieldIndex] }
    updatedField.addressFields = [...updatedField.addressFields, newField]
    updateField(fieldIndex, updatedField)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFileName(file.name)
      setForm(prev => ({
        ...prev,
        logo: file
      }))
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const publishForm = async() => {
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('created_by', user_id)
    formData.append('website_url', form.website_url || '')
    formData.append('fields', JSON.stringify(form.fields))
    
    if (form.logo) {
      formData.append('logo', form.logo)
    }

    setLoading(true)
    
    if (!user_id) {
      toast.error('You must be logged in to create a form')
      setLoading(false)
      return
    }

    // if(!form.description){
    //   toast.error('Description is required')
    //   setLoading(false)
    //   return
    // }
    
    if(!form.title){
      toast.error('Title is required')
      setLoading(false)
      return
    }

    try {
      const resp = await publicAxios.post('/form/list/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if(resp.data.success === true) {
        setLoading(false)
        toast.success('Form created successfully')
        router.push('/my-all-form')
        refetch()
      } else {
        setLoading(false)
        toast.error(resp.data.message || 'Failed to create form')
      }
    } catch (error) {
      setLoading(false)
      toast.error(error.response?.data?.message || error.message || 'Something went wrong - please try again later')
    }
  }

  const fieldTypes = [
    { value: 'text', label: 'Short Answer', icon: <FaFont className="text-[#1A1466] mr-2" /> },
    { value: 'textarea', label: 'Paragraph', icon: <FaAlignLeft className="text-[#1A1466] mr-2" /> },
    { value: 'radio', label: 'Multiple Choice', icon: <FaRegCircle className="text-[#1A1466] mr-2 " /> },
    { value: 'checkbox', label: 'Checkboxes', icon: <FaRegCheckSquare className="text-[#1A1466] mr-2" /> },
    { value: 'dropdown', label: 'Dropdown', icon: <FaDropdown className="text-[#1A1466] mr-2" /> },
    { value: 'date', label: 'Date', icon: <FaCalendarAlt className="text-[#1A1466] mr-2" /> },
    { value: 'time', label: 'Time', icon: <FaClock className="text-[#1A1466] mr-2" /> },
    { value: 'file', label: 'File Upload', icon: <FiImage className="text-[#1A1466] mr-2" /> },
    { value: 'email', label: 'Email', icon: <FaEnvelope className="text-[#1A1466] mr-2" /> },
    { value: 'address', label: 'Address', icon: <FaGlobe className="text-[#1A1466] mr-2" /> },
    { value: 'phone', label: 'Phone Number', icon: <FaHashtag className="text-[#1A1466] mr-2" /> },
    { value: 'signature', label: 'Signature', icon: <FaSignature className="text-[#1A1466] mr-2" /> },
    { value: 'url', label: 'Website URL', icon: <FaLink className="text-[#1A1466] mr-2" /> }
  ]

  const toggleSelect = (index) => {
    setIsSelectOpen(!isSelectOpen)
    setCurrentSelectIndex(index)
  }

  const handleSelectChange = (index, value) => {
    const defaultHeading = getDefaultHeading(value)
    const updatedField = {
      ...form.fields[index],
      type: value,
      heading: defaultHeading,
      options: ['radio', 'checkbox', 'dropdown'].includes(value) ? form.fields[index].options : []
    }
    
    if (value === 'address') {
      updatedField.addressFields = getDefaultAddressFields()
    }
    
    updateField(index, updatedField)
    setIsSelectOpen(false)
  }

  const renderFieldInput = (field, index) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] bg-transparent"
            placeholder={field.type === 'email' ? 'email@example.com' : field.type === 'number' ? '123' : 'Your answer'}
            disabled
          />
        )
      case 'textarea':
        return (
          <textarea
            className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] bg-transparent"
            placeholder="Your answer"
            rows={3}
            disabled
          />
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <FaRegCircle className="text-[#1A1466]  mr-2" />
                <input type="radio" className="mr-2" disabled />
                <span>{option}</span>
              </div>
            ))}
            {field.options.length === 0 && (
              <div className="text-gray-400 flex items-center">
                <FaRegCircle className="mr-2" />
                <span>No options added</span>
              </div>
            )}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <FaRegCheckSquare className="text-[#1A1466] mr-2" />
                <input type="checkbox" className="mr-2" disabled />
                <span>{option}</span>
              </div>
            ))}
            {field.options.length === 0 && (
              <div className="text-gray-400 flex items-center">
                <FaRegCheckSquare className="mr-2" />
                <span>No options added</span>
              </div>
            )}
          </div>
        )
      case 'dropdown':
        return (
          <div className="relative">
            <select className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] appearance-none bg-transparent" disabled>
              <option value="">{field.options.length > 0 ? "Select an option" : "No options added"}</option>
              {field.options.map((option, optIndex) => (
                <option key={optIndex} value={option}>{option}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-0 top-3 text-[#1A1466]" />
          </div>
        )
      case 'date':
        return (
          <input
            type="date"
            className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] bg-transparent"
            disabled
          />
        )
      case 'time':
        return (
          <input
            type="time"
            className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] bg-transparent"
            disabled
          />
        )
      case 'file':
        return (
          <div className="border-2 border-dashed border-[#CCCAEC] rounded p-4 text-center">
            <button 
              className="bg-[#F4F4FF] hover:bg-[#E9E9FD] px-4 py-2 rounded text-sm text-[#1A1466] flex items-center mx-auto"
              disabled
            >
              <FiUpload className="mr-2" />
              Upload file
            </button>
            {uploadedFileName && (
              <p className="text-sm text-[#1A1466] mt-2">
                {uploadedFileName}
              </p>
            )}
          </div>
        )
      case 'address':
        return (
          <div className="border border-[#CCCAEC] rounded-lg p-4 space-y-4 bg-[#F4F4FF]">
            {field.addressFields?.map((addrField, addrIndex) => (
              <div key={addrField.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[#1A1466]">
                    {addrField.label}
                    {addrField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {addrField.label !== 'Street Address' && 
                   addrField.label !== 'City' && 
                   addrField.label !== 'State/Province' && 
                   addrField.label !== 'Postal/Zip Code' && 
                   addrField.label !== 'Country' && (
                    <button 
                      onClick={() => removeAddressField(index, addrIndex)}
                      className="text-[#1A1466] hover:text-red-500"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="w-full border border-[#CCCAEC] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1A1466] focus:border-[#1A1466] bg-white"
                  placeholder={`Enter ${addrField?.label?.toLowerCase()}`}
                  disabled
                />
              </div>
            ))}
            <button
              onClick={() => addCustomAddressField(index)}
              className="px-3 py-1 bg-[#E9E9FD] text-[#1A1466] rounded text-sm hover:bg-[#D9D9FD]"
            >
              Add Custom Field
            </button>
          </div>
        )
      case 'phone':
        return (
          <div className="flex items-center">
            <div className="relative w-32 mr-2">
              <select 
                className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] appearance-none bg-transparent"
                disabled
              >
                {countryCodes.map((country, idx) => (
                  <option key={idx} value={country.code}>
                    {country.code} {country.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-0 top-3 text-[#1A1466]" />
            </div>
            <input
              type="tel"
              className="flex-1 border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] bg-transparent"
              placeholder="Phone number"
              disabled
            />
          </div>
        )
      case 'signature':
        return (
          <div className="border-2 border-dashed border-[#CCCAEC] rounded p-4 text-center h-32 flex items-center justify-center bg-[#F4F4FF]">
            <div className="text-center">
              <FaSignature className="mx-auto text-[#1A1466] text-3xl mb-2" />
              <p className="text-[#1A1466]">Click to sign</p>
            </div>
          </div>
        )
      case 'url':
        return (
          <input
            type="url"
            className="w-full border-b border-[#CCCAEC] py-2 focus:outline-none focus:border-[#1A1466] bg-transparent"
            placeholder="https://example.com"
            disabled
          />
        )
      default:
        return null
    }
  }

  return (
    <div className=' px-4 lg:px-8  '>
      <div className=" text-black mt-28 rounded-2xl border border-[#1A1466] overflow-hidden mb-8 bg-white">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#1A1466] to-[#8886CD] px-4 lg:px-6 py-5">
          <div className="sm:flex  justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                <FiEdit2 className="text-[#1A1466] text-lg" />
              </div>
              <h1 className=" text-lg md:text-2xl font-bold text-white">
                {id ? `Using Template: ${dataForm?.title}` : 'Create New Form'}
              </h1>
            </div>

            <div className='h-4 md:hidden w-full'>

            </div>
            <Link
              href={'/classic-form'}
              className="bg-white   text-[#1A1466] text-xs font-semibold px-3 cursor-pointer py-1 rounded-full whitespace-nowrap shadow-sm hover:bg-gray-100"
            >
              Use Template
            </Link>
          </div>
        </div>

        {/* Form Content */}
        <div className=" px-3 md:px-6 py-5">
          {/* Form Title and Description */}
          <div className="mb-8 p-6 bg-[#F4F4FF] rounded-lg border border-[#CCCAEC]">
            <input
              type="text"
              className="w-full text-lg md:text-2xl font-bold border-b border-transparent hover:border-[#CCCAEC] focus:border-[#1A1466] focus:border-b-2 duration-300 focus:outline-none py-2 bg-transparent"
              placeholder="Form Title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
            <input
              type="text"
              className="w-full text-sm md:text-lg font-medium border-b border-transparent hover:border-[#CCCAEC] focus:border-[#1A1466] focus:border-b-2 duration-300 focus:outline-none py-2 bg-transparent mt-4"
              placeholder="Form Description"
              required
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
            
            {/* Logo and Website URL Fields */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <button
                  onClick={triggerFileInput}
                  className="bg-[#E9E9FD] text-[#1A1466] px-4 py-2 rounded-md text-sm hover:bg-[#D9D9FD] flex items-center"
                >
                  <FiUpload className="mr-2" />
                  {form.logo ? 'Change Logo' : 'Upload Logo'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                {form.logo && (
                  <div className="ml-4 flex items-center">
                    <span className="text-sm text-[#1A1466] mr-2">
                      {uploadedFileName || 'Logo selected'}
                    </span>
                    <button
                      onClick={() => {
                        setForm(prev => ({...prev, logo: null}))
                        setUploadedFileName('')
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="url"
                  className="w-full text-sm border-b border-transparent hover:border-[#CCCAEC] focus:border-[#1A1466] focus:border-b-2 duration-300 focus:outline-none py-2 bg-transparent"
                  placeholder="Website URL (optional)"
                  value={form.website_url}
                  onChange={(e) => setForm({...form, website_url: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {form.fields.map((field, index) => (
              <div 
                key={field.id} 
                ref={el => fieldRefs.current[index] = el}
                className="p-6 bg-[#F4F4FF] rounded-lg border border-[#CCCAEC]"
              >
                {editingFieldIndex === index ? (
                  <div className="space-y-4">
                    <div className="md:flex justify-between">
                      <input
                        type="text"
                        className="w-full md:text-lg font-bold border-b border-transparent hover:border-[#CCCAEC] focus:border-[#1A1466] focus:border-b-2 duration-300 focus:outline-none py-1 bg-transparent"
                        value={field.heading}
                        onChange={(e) => updateField(index, {...field, heading: e.target.value})}
                      />
                      <div className="relative  mt-2 md:mt-0 md:ml-4">
                        <button
                          className="flex items-center border border-[#CCCAEC] rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1466] focus:border-[#1A1466] w-48"
                          onClick={() => toggleSelect(index)}
                        >
                          {fieldTypes.find(type => type.value === field.type)?.icon}
                          <span className="flex-1 text-left text-[#1A1466]">
                            {fieldTypes.find(type => type.value === field.type)?.label}
                          </span>
                          <FiChevronDown className={`ml-2 text-[#1A1466] transition-transform ${isSelectOpen && currentSelectIndex === index ? 'transform rotate-180' : ''}`} />
                        </button>
                        
                        {isSelectOpen && currentSelectIndex === index && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-[#CCCAEC] rounded shadow-lg max-h-60 overflow-y-auto">
                            {fieldTypes.map((type) => (
                              <div
                                key={type.value}
                                className="flex items-center px-3 py-2 hover:bg-[#1A1466] hover:text-white cursor-pointer"
                                onClick={() => handleSelectChange(index, type.value)}
                              >
                                {type.icon}
                                <span>{type.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      className="w-full text-gray-600 border-b border-transparent hover:border-[#CCCAEC] focus:border-[#1A1466] focus:border-b-2 duration-300 focus:outline-none py-1 text-sm bg-transparent"
                      placeholder="Description (optional)"
                      value={field.description}
                      onChange={(e) => updateField(index, {...field, description: e.target.value})}
                    />
                    
                    {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && (
                      <div className="space-y-3 ml-4">
                        <div className="space-y-2">
                          {field.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              {field.type === 'radio' && <FaRegCircle className="text-[#1A1466] " />}
                              {field.type === 'checkbox' && <FaRegCheckSquare className="text-[#1A1466] " />}
                              {field.type === 'dropdown' && <FaHashtag className="text-[#1A1466] " />}
                              <input
                                type="text"
                                className="border-b border-[#CCCAEC] py-1 focus:outline-none focus:border-[#1A1466] flex-1 ml-2 bg-transparent"
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                placeholder="Option text"
                              />
                              <button
                                onClick={() => removeOption(index, optIndex)}
                                className="text-[#1A1466] hover:text-red-500 p-1"
                              >
                                <FiX size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <input
                            type="text"
                            className="border-b border-[#CCCAEC] py-1 focus:outline-none focus:border-[#1A1466] flex-1 ml-2 bg-transparent"
                            value={newOptionText}
                            onChange={(e) => setNewOptionText(e.target.value)}
                            placeholder="Add another option"
                            onKeyDown={(e) => e.key === 'Enter' && addOption(index)}
                          />
                          <button
                            onClick={() => {
                              if (newOptionText.trim()) {
                                addOption(index);
                            }
                            }}
                            className="px-3 py-1 bg-[#1A1466] text-white rounded cursor-pointer text-sm hover:bg-[#0e0b3d]"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {field.type === 'address' && (
                      <div className="space-y-4 mt-4 border border-[#CCCAEC] rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-[#1A1466]">Address Fields</h4>
                          <button
                            onClick={() => addCustomAddressField(index)}
                            className="px-3 py-1 bg-[#E9E9FD] text-[#1A1466] rounded text-sm hover:bg-[#D9D9FD]"
                          >
                            Add Custom Field
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {field.addressFields?.map((addrField, addrIndex) => (
                            <div key={addrField.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <input
                                  type="text"
                                  className="border-b border-[#CCCAEC] py-1 focus:outline-none focus:border-[#1A1466] w-1/2 bg-transparent"
                                  value={addrField.label}
                                  onChange={(e) => updateAddressField(index, addrIndex, 'label', e.target.value)}
                                  placeholder="Field label"
                                  disabled={['Street Address', 'City', 'State/Province', 'Postal/Zip Code', 'Country'].includes(addrField.label)}
                                />
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center text-sm text-[#1A1466]">
                                    <input
                                      type="checkbox"
                                      className="mr-2"
                                      checked={addrField.required}
                                      onChange={(e) => updateAddressField(index, addrIndex, 'required', e.target.checked)}
                                    />
                                    Required
                                  </label>
                                  {!['Street Address', 'City', 'State/Province', 'Postal/Zip Code', 'Country'].includes(addrField.label) && (
                                    <button
                                      onClick={() => removeAddressField(index, addrIndex)}
                                      className="text-[#1A1466] hover:text-red-500 p-1"
                                    >
                                      <FiTrash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-[#CCCAEC]">
                      <label className="flex items-center text-sm text-[#1A1466]">
                        <div 
                          className={`relative inline-flex items-center h-6 rounded-full w-11 mr-2 transition-colors ${field.required ? 'bg-[#1A1466]' : 'bg-[#CCCAEC]'}`}
                          onClick={() => updateField(index, {...field, required: !field.required})}
                        >
                          <span 
                            className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${field.required ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </div>
                        Required
                      </label>
                  
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingFieldIndex(null)}
                          className="px-3 py-1 bg-[#CCCAEC] hover:bg-[#B9B7E5] rounded text-sm text-[#1A1466]"
                        >
                          Done
                        </button>
                        <button
                          onClick={() => deleteField(index)}
                          className="p-1 text-[#1A1466] hover:text-red-500"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="bg-white flex items-center p-2 rounded-lg border border-[#CCCAEC] mr-3 mt-0.5">
                          <span className='ml-2'>
                            {fieldTypes.find(type => type.value === field.type)?.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="md:text-lg mt-2 md:mt-0 font-bold text-[#1A1466]">
                            {field.heading || 'Untitled Question'}
                          </h3>
                          {field.description && (
                            <p className="text-sm text-[#8886CD] mt-1">{field.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex mt-2 md:mt-0 space-x-2">
                        <button
                          onClick={() => setEditingFieldIndex(index)}
                          className="p-1 text-[#1A1466] hover:bg-[#E9E9FD] rounded"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteField(index)}
                          className="p-1 text-[#1A1466] hover:text-red-500 hover:bg-[#E9E9FD] rounded"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 ml-11 pl-2">
                      {renderFieldInput(field, index)}
                    </div>
                    {field.required && (
                      <p className="text-xs text-red-500 mt-1 ml-11 pl-2">* Required</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addNewField}
              className="flex fixed    right-8 md:right-24 top-3/5 p-3 items-center cursor-pointer bg-[#1A1466] rounded-full mt-8  shadow-lg hover:bg-[#0e0b3d] transition-colors"
            >
              <FiPlus className="text-white text-2xl" />
            </button>
          </div>

          <div className="mt-8 flex justify-start">
            <button
              onClick={publishForm}
              className="px-6 py-2 cursor-pointer bg-[#1A1466] text-white rounded-md shadow hover:bg-[#0e0b3d]"
            >
              {loading ? 'Publishing...' : "Publish Form"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateFormPage() {
  return (
    <>
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading form editor...</div>}>
        <FormEditorContent />
      </Suspense>
      <ToastContainer />
    </>
  )
}