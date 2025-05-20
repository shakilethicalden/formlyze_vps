import usePublicAxios from '@/hooks/usePublicAxios'
import jsPDF from 'jspdf'
import React from 'react'
import logo from '@/assets/images/logo/formlazy logo.png'
import {
  FiDownload,
  FiCalendar,
  FiMail,
  FiFileText,
  FiLink,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiChevronDown,
  FiUser,
  FiCircle,
  FiSquare,
  FiType,
  FiAlignLeft,
  FiHash,
  FiPenTool
} from 'react-icons/fi'

const SingleResponse = ({ data }) => {
  const formatDate = dateString => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fieldIcons = {
    text: <FiType />,
    textarea: <FiAlignLeft />,
    email: <FiMail />,
    file: <FiFileText />,
    radio: <FiCircle />,
    checkbox: <FiSquare />,
    dropdown: <FiChevronDown />,
    date: <FiCalendar />,
    number: <FiHash />,
    address: <FiMapPin />,
    signature: <FiPenTool />,
    url: <FiLink />,
    phone: <FiPhone />
  }

  const getFieldIcon = type => {
    return fieldIcons[type] || <FiEdit2 />
  }
  const publicAxios = usePublicAxios()
  console.log(data, 'ha data')

  // const downLoadPdf = async()=>{
  //   const resp =await publicAxios.get(`form/export-responses/${52}/`);
  //   console.log(resp);
  // }

  const downLoadPdf = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const leftMargin = 15
    const rightMargin = 15
    const pageWidth =
      pdf.internal.pageSize.getWidth() - leftMargin - rightMargin
    const questionColWidth = pageWidth * 0.35
    const answerColWidth = pageWidth * 0.65
    let yPosition = 20 // Starting position for content after the header

    const styles = {
      question: {
        fontSize: 9,
        textColor: [26, 20, 102],
        fillColor: [244, 244, 255]
      },
      answer: {
        fontSize: 9,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      header: {
        fontSize: 12,
        textColor: [0, 0, 0]
      },
      formTitle: {
        fontSize: 16,
        textColor: [26, 20, 102], // Updated title color to #1A1466
        fontStyle: 'bold'
      }
    }

    // Form Title (Centered and Stylish)
    pdf.setFontSize(styles.formTitle.fontSize)
    pdf.setTextColor(...styles.formTitle.textColor)
    pdf.setFont(styles.formTitle.fontStyle)
    const formTitle = data.form_title || 'Untitled Form' // Use form title from data
    const titleWidth =
      (pdf.getStringUnitWidth(formTitle) * styles.formTitle.fontSize) /
      pdf.internal.scaleFactor
    const titleX = (pageWidth - titleWidth) / 2 // Centered title
    pdf.text(formTitle, titleX, yPosition)

    yPosition += 15 // Add some space after title

    // Email (left-aligned)
    pdf.setFontSize(styles.header.fontSize)
    pdf.setTextColor(...styles.header.textColor)
    pdf.text(`Email: ${data.responder_email || 'N/A'}`, leftMargin, yPosition)

    // Submission Date (right-aligned)
    pdf.text(
      `Submitted: ${new Date().toLocaleDateString()}`,
      pageWidth - rightMargin - 50,
      yPosition
    )
    yPosition += 10

    // Table Header
    pdf.setFillColor(...styles.question.fillColor)
    pdf.rect(leftMargin, yPosition, questionColWidth, 7, 'F')
    pdf.rect(leftMargin + questionColWidth, yPosition, answerColWidth, 7, 'F')

    pdf.setFontSize(styles.question.fontSize)
    pdf.setTextColor(...styles.question.textColor)
    pdf.text('Question', leftMargin + 5, yPosition + 5)
    pdf.text('Response', leftMargin + questionColWidth + 5, yPosition + 5)
    yPosition += 9

    const addFormattedText = (text, x, y, width, style, isLink = false) => {
      pdf.setFontSize(style.fontSize)
      pdf.setTextColor(...style.textColor)
      const lines = pdf.splitTextToSize(text, width - 10)
      const lineHeight = style.fontSize * 0.5
      const padding = 3

      let currentY = y + padding + lineHeight
      lines.forEach((line, i) => {
        if (isLink && i === lines.length - 1) {
          pdf.textWithLink(line, x + 5, currentY, { url: text })
        } else {
          pdf.text(line, x + 5, currentY)
        }
        currentY += lineHeight
      })

      return Math.max(10, lines.length * lineHeight + padding * 2)
    }

    const formatAddressAnswer = (address, x, y) => {
      const lineHeight = 5
      const padding = 5
      const addressParts = address
        ? Object.entries(address)
            .filter(([_, v]) => v)
            .map(([k, v]) => [
              k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()),
              v
            ])
        : []

      const rowCount = Math.max(1, addressParts.length)
      const cellHeight = rowCount * lineHeight + padding * 2

      pdf.setFillColor(...styles.answer.fillColor)
      pdf.rect(x, y, answerColWidth, cellHeight, 'FD')

      if (!addressParts.length) {
        pdf.setTextColor(...styles.answer.textColor)
        pdf.text('No address provided', x + padding, y + padding + 4)
      } else {
        let currentY = y + padding
        addressParts.forEach(([label, value]) => {
          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`${label}:`, x + padding, currentY)

          pdf.setFontSize(9)
          pdf.setTextColor(0, 0, 0)
          pdf.text(String(value), x + 35, currentY)

          currentY += lineHeight
        })
      }

      return cellHeight
    }

    // To track displayed questions
    const displayedQuestions = new Set()

    // for (const field of data.response_data || []) {
    //   const questionText = field.question_title || ''
    //   let answerText = ''
    //   let isLink = false
    //   let isAddress = field.field_type === 'address'

    //   // Skip duplicate questions by checking if the question has been displayed
    //   if (displayedQuestions.has(questionText)) continue
    //   displayedQuestions.add(questionText)

    //   let questionHeight = addFormattedText(
    //     questionText,
    //     0,
    //     0,
    //     questionColWidth,
    //     styles.question,
    //     false
    //   )
    //   let answerHeight = 0

    //   if (isAddress) {
    //     answerHeight = formatAddressAnswer(
    //       field.response,
    //       leftMargin + questionColWidth,
    //       yPosition
    //     )
    //   } else {
    //     switch (field.field_type) {
    //       case 'text':
    //       case 'textarea':
    //         answerText = field?.response || 'No response provided'
    //         break
    //       case 'email':
    //       case 'url':
    //       case 'file':
    //         answerText = field?.response || `No ${field.field_type} provided`
    //         isLink = !!field.response
    //         break
    //       case 'checkbox':
    //         answerText =
    //           Array.isArray(field.response) && field.response.length > 0
    //             ? field.response.join(', ')
    //             : 'No options selected'
    //         break
    //       case 'dropdown':
    //       case 'radio':
    //       case 'number':
    //       case 'phone':
    //         answerText = field.response || 'No selection'
    //         break
    //       case 'date':
    //         answerText = field.response
    //           ? new Date(field.response).toLocaleDateString()
    //           : 'No date selected'
    //         break
    //       default:
    //         answerText = field.response || 'No response'
    //     }

    //     answerHeight = addFormattedText(
    //       answerText,
    //       leftMargin + questionColWidth,
    //       yPosition,
    //       answerColWidth,
    //       styles.answer,
    //       isLink
    //     )
    //   }

    //   const finalRowHeight = Math.max(10, questionHeight, answerHeight)

    //   if (yPosition + finalRowHeight > pdf.internal.pageSize.getHeight() - 20) {
    //     pdf.addPage()
    //     yPosition = 20
    //   }

    //   pdf.setFillColor(...styles.question.fillColor)
    //   pdf.rect(leftMargin, yPosition, questionColWidth, finalRowHeight, 'F')
    //   pdf.setDrawColor(204, 202, 236)
    //   pdf.rect(leftMargin, yPosition, questionColWidth, finalRowHeight)

    //   pdf.setFillColor(...styles.answer.fillColor)
    //   pdf.rect(
    //     leftMargin + questionColWidth,
    //     yPosition,
    //     answerColWidth,
    //     finalRowHeight,
    //     'F'
    //   )
    //   pdf.rect(
    //     leftMargin + questionColWidth,
    //     yPosition,
    //     answerColWidth,
    //     finalRowHeight
    //   )

    //   addFormattedText(
    //     questionText,
    //     leftMargin,
    //     yPosition,
    //     questionColWidth,
    //     styles.question,
    //     false
    //   )

    //   if (isAddress) {
    //     formatAddressAnswer(
    //       field.response,
    //       leftMargin + questionColWidth,
    //       yPosition
    //     )
    //   } else {
    //     addFormattedText(
    //       answerText,
    //       leftMargin + questionColWidth,
    //       yPosition,
    //       answerColWidth,
    //       styles.answer,
    //       isLink
    //     )
    //   }

    //   yPosition += finalRowHeight + 3
    // }

    for (const field of data.response_data || []) {
      const questionText = field.question_title || ''
      let answerText = ''
      let isLink = false
      let isAddress = field.field_type === 'address'

      if (displayedQuestions.has(questionText)) continue
      displayedQuestions.add(questionText)

      let answerHeight = 0
      let questionHeight = 10 // Set a default estimated height

      if (isAddress) {
        answerHeight = formatAddressAnswer(
          field.response,
          leftMargin + questionColWidth,
          yPosition
        )
      } else {
        switch (field.field_type) {
          case 'text':
          case 'textarea':
            answerText = field?.response || 'No response provided'
            break
          case 'email':
          case 'url':
          case 'file':
            answerText = field?.response || `No ${field.field_type} provided`
            isLink = !!field.response
            break
          case 'checkbox':
            answerText =
              Array.isArray(field.response) && field.response.length > 0
                ? field.response.join(', ')
                : 'No options selected'
            break
          case 'dropdown':
          case 'radio':
          case 'number':
          case 'phone':
            answerText = field.response || 'No selection'
            break
          case 'date':
            answerText = field.response
              ? new Date(field.response).toLocaleDateString()
              : 'No date selected'
            break
          default:
            answerText = field.response || 'No response'
        }

        answerHeight = addFormattedText(
          answerText,
          leftMargin + questionColWidth,
          yPosition,
          answerColWidth,
          styles.answer,
          isLink
        )
      }

      const finalRowHeight = Math.max(10, questionHeight, answerHeight)

      if (yPosition + finalRowHeight > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFillColor(...styles.question.fillColor)
      pdf.rect(leftMargin, yPosition, questionColWidth, finalRowHeight, 'F')
      pdf.setDrawColor(204, 202, 236)
      pdf.rect(leftMargin, yPosition, questionColWidth, finalRowHeight)

      pdf.setFillColor(...styles.answer.fillColor)
      pdf.rect(
        leftMargin + questionColWidth,
        yPosition,
        answerColWidth,
        finalRowHeight,
        'F'
      )
      pdf.rect(
        leftMargin + questionColWidth,
        yPosition,
        answerColWidth,
        finalRowHeight
      )

      addFormattedText(
        questionText,
        leftMargin,
        yPosition,
        questionColWidth,
        styles.question,
        false
      )

      if (isAddress) {
        formatAddressAnswer(
          field.response,
          leftMargin + questionColWidth,
          yPosition
        )
      } else {
        addFormattedText(
          answerText,
          leftMargin + questionColWidth,
          yPosition,
          answerColWidth,
          styles.answer,
          isLink
        )
      }

      yPosition += finalRowHeight + 3
    }

    pdf.save(
      `response_${
        (data.form_title, ' ', data.responder_email)
      }  ${Date.now()}.pdf`
    )
  }

  return (
    <div
      id='pdf'
      className=' text-black mt-28 rounded-2xl overflow-hidden border mb-8 bg-white'
    >
      {/* Response Header */}
      <div className='bg-gradient-to-r from-[#1A1466] to-[#8886CD] px-3 lg:px-6 py-5'>
        <div className='md:flex justify-between items-center'>
          <div>
            <div className='flex items-center mb-1'>
              <div className='bg-white p-2 rounded-full shadow-sm mr-3'>
                <FiUser className='text-[#1A1466] text-lg' />
              </div>
              <div>
                <h3 className='text-xl font-semibold text-white'>
                  {data.responder_email || 'Anonymous Respondent'}
                </h3>
                <p className='text-sm text-[#CCCAEC] flex items-center mt-1'>
                  <FiCalendar className='mr-1.5' />
                  <span>Submitted {formatDate(data.created_at)}</span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={downLoadPdf}
            className='bg-white text-[#1A1466] text-xs font-semibold px-3 cursor-pointer py-1 rounded-full mt-4 md:mt-0 shadow-sm hover:bg-gray-100'
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Response Data */}
      <div className='px-2 lg:px-6 py-5'>
        {data.response_data?.map((field, index) => (
          <div key={index} className='mb-6 last:mb-0 group'>
            {/* Question Header */}
            <div className='flex items-start mb-3'>
              <div className='bg-[#F4F4FF] p-2 rounded-lg border border-[#CCCAEC] mr-3 mt-0.5'>
                {getFieldIcon(field.field_type)}
              </div>
              <div className='flex-1'>
                <h4 className='text-lg font-semibold text-[#1A1466]'>
                  {field.question_title || 'Untitled Question'}
                </h4>
                <div className='w-full h-px bg-[#CCCAEC] mt-2 opacity-50'></div>
              </div>
            </div>

            {/* Answer Container */}
            <div className='lg:ml-11 lg:pl-2 -ml-12 md:-ml-0'>
              {/* All response type renderers remain the same */}
              {/* ... */}

              <div className='ml-11 pl-2'>
                {/* Text Response */}
                {field.field_type === 'text' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC]'>
                    <p className='text-gray-800 font-medium'>
                      {field.response || (
                        <span className='text-gray-500 italic'>
                          No response provided
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Textarea Response */}
                {field.field_type === 'textarea' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] whitespace-pre-line'>
                    <p className='text-gray-800 font-medium'>
                      {field.response || (
                        <span className='text-gray-500 italic'>
                          No response provided
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Email Response */}
                {field.field_type === 'email' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiMail className='text-[#1A1466] mr-3 text-lg' />
                    {field.response ? (
                      <a
                        href={`mailto:${field.response}`}
                        className='text-[#1A1466] hover:underline font-medium'
                      >
                        {field.response}
                      </a>
                    ) : (
                      <span className='text-gray-500 italic'>
                        No email provided
                      </span>
                    )}
                  </div>
                )}

                {/* File Upload Response */}
                {field.field_type === 'file' &&
                  (field.response ? (
                    <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center justify-between'>
                      <div className='flex items-center'>
                        <FiFileText className='text-[#1A1466] mr-3 text-xl' />
                        <div>
                          <p className='text-gray-800 font-medium'>
                            {field.response}
                          </p>
                          {/* <p className="text-xs text-gray-500">{Math.round(field.response.size / 1024)} KB</p> */}
                        </div>
                      </div>
                      <a
                        href={`http://127.0.0.1:8000/media/images/${field.response}`}
                        download
                        className='text-sm bg-white px-3 py-1.5 rounded-lg border border-[#CCCAEC] text-[#1A1466] hover:bg-[#E9E9FD] flex items-center'
                      >
                        <FiDownload className='mr-1.5' /> Download
                      </a>
                    </div>
                  ) : (
                    <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC]'>
                      <p className='text-gray-500 italic'>No file uploaded</p>
                    </div>
                  ))}

                {/* Radio Response */}
                {field.field_type === 'radio' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiCircle className='text-[#1A1466] mr-3 text-lg' />
                    <span className='text-gray-800 font-medium'>
                      {field.response || (
                        <span className='text-gray-500 italic'>
                          No selection
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Checkbox Response */}
                {field.field_type === 'checkbox' && (
                  <div className='space-y-2'>
                    {Array.isArray(field.response) &&
                    field.response.length > 0 ? (
                      field.response.map((item, i) => (
                        <div
                          key={i}
                          className='bg-[#F4F4FF] p-3 rounded-lg border border-[#CCCAEC] flex items-center'
                        >
                          <FiSquare className='text-[#1A1466] mr-3' />
                          <span className='text-gray-800 font-medium'>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC]'>
                        <p className='text-gray-500 italic'>
                          No options selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dropdown Response */}
                {field.field_type === 'dropdown' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiChevronDown className='text-[#1A1466] mr-3 text-lg' />
                    <span className='text-gray-800 font-medium'>
                      {field.response || (
                        <span className='text-gray-500 italic'>
                          No selection
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Date Response */}
                {field.field_type === 'date' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiCalendar className='text-[#1A1466] mr-3 text-lg' />
                    <span className='text-gray-800 font-medium'>
                      {field.response ? (
                        new Date(field.response).toLocaleDateString()
                      ) : (
                        <span className='text-gray-500 italic'>
                          No date selected
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Number Response */}
                {field.field_type === 'number' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiHash className='text-[#1A1466] mr-3 text-lg' />
                    <p className='text-gray-800 font-medium'>
                      {field.response || (
                        <span className='text-gray-500 italic'>
                          No response
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Address Response */}
                {field.field_type === 'address' && (
                  <div className='bg-[#F4F4FF] p-5 rounded-lg border border-[#CCCAEC]'>
                    {field.response ? (
                      <>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                          {Object.entries(field.response).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className='bg-white p-3 rounded-lg border border-[#CCCAEC]'
                              >
                                <p className='text-xs text-[#1A1466] uppercase font-medium mb-1'>
                                  {key}
                                </p>
                                <p className='text-gray-800 font-medium'>
                                  {value || '-'}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                        <button className='text-sm bg-white px-3 py-1.5 rounded-lg border border-[#CCCAEC] text-[#1A1466] hover:bg-[#E9E9FD] flex items-center'>
                          <FiMapPin className='mr-1.5' /> View on Map
                        </button>
                      </>
                    ) : (
                      <p className='text-gray-500 italic'>
                        No address provided
                      </p>
                    )}
                  </div>
                )}

                {/* Signature Response */}
                {field.field_type === 'signature' &&
                  (field.response ? (
                    <div className='bg-[#F4F4FF] p-5 rounded-lg border border-[#CCCAEC]'>
                      <div className='border border-[#CCCAEC] rounded-lg p-3 bg-white'>
                        <img
                          src={`http://127.0.0.1:8000/media/images/${field.response}`}
                          alt='Signature'
                          className='max-h-32 mx-auto'
                        />
                      </div>
                      <button className='mt-3 text-sm bg-white px-3 py-1.5 rounded-lg border border-[#CCCAEC] text-[#1A1466] hover:bg-[#E9E9FD] flex items-center'>
                        <FiDownload className='mr-1.5 cursor-pointer' />{' '}
                        Download Signature
                      </button>
                    </div>
                  ) : (
                    <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC]'>
                      <p className='text-gray-500 italic'>
                        No signature provided
                      </p>
                    </div>
                  ))}

                {/* URL Response */}
                {field.field_type === 'url' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiLink className='text-[#1A1466] mr-3 text-lg' />
                    {field.response ? (
                      <a
                        href={field.response}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[#1A1466] hover:underline font-medium truncate'
                      >
                        {field.response}
                      </a>
                    ) : (
                      <span className='text-gray-500 italic'>
                        No URL provided
                      </span>
                    )}
                  </div>
                )}

                {/* Phone Response */}
                {field.field_type === 'phone' && (
                  <div className='bg-[#F4F4FF] p-4 rounded-lg border border-[#CCCAEC] flex items-center'>
                    <FiPhone className='text-[#1A1466] mr-3 text-lg' />
                    {field.response ? (
                      <a
                        href={`tel:${field.response}`}
                        className='text-[#1A1466] hover:underline font-medium'
                      >
                        {field.response}
                      </a>
                    ) : (
                      <span className='text-gray-500 italic'>
                        No phone number provided
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SingleResponse
