import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQs = () => {
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqContents = [
    {
      id: 1,
      topContent: 'How does Lancer differ from other freelancing platforms?',
      fullContent: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci, et beatae. Hic minus odio dignissimos minima dolorem a, perspiciatis nihil provident, culpa impedit sit nemo pariatur nulla ex eius doloremque.'
    },
    {
      id: 2,
      topContent: 'When will Lancer launch?',
      fullContent: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci, et beatae. Hic minus odio dignissimos minima dolorem a, perspiciatis nihil provident, culpa impedit sit nemo pariatur nulla ex eius doloremque.'
    },
    {
      id: 3,
      topContent: 'Is Lancer free to use?',
      fullContent: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci, et beatae. Hic minus odio dignissimos minima dolorem a, perspiciatis nihil provident, culpa impedit sit nemo pariatur nulla ex eius doloremque.'
    },
    {
      id: 4,
      topContent: 'What types of skills and industries does Lancer support?',
      fullContent: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci, et beatae. Hic minus odio dignissimos minima dolorem a, perspiciatis nihil provident, culpa impedit sit nemo pariatur nulla ex eius doloremque.'
    },
    {
      id: 5,
      topContent: 'How does the skill assessment work?',
      fullContent: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci, et beatae. Hic minus odio dignissimos minima dolorem a, perspiciatis nihil provident, culpa impedit sit nemo pariatur nulla ex eius doloremque.'
    }
  ]

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className='w-full bg-[#F3F4F6] flex flex-col items-center justify-start py-16 min-h-[80vh] basic-font'>
      {/* Header Section */}
      <div className='flex flex-col justify-center text-center items-center gap-6 mb-12'>
        <span className='text-gray-800 px-6 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg font-medium'>
          FAQ
        </span>
        <h2 className='font-medium text-2xl max-w-3xl text-primary'>
          Got questions about Lancer?
          <br />
          We've got answers.
        </h2>
      </div>

      {/* FAQ Accordion Section */}
      <div className='w-full max-w-5xl px-6'>
        {faqContents.map((faq) => (
          <div
            key={faq.id}
            className='mb-4 border-2 border-[#2255D7] rounded-lg bg-white overflow-hidden transition-all duration-300 ease-in-out'
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className='w-full px-6 py-7 text-left flex justify-between items-center hover:bg-blue-50 transition-colors duration-200'
            >
              <span className='text-primary font-normal text-[1rem] pr-4'>
                {faq.topContent}
              </span>
              <ChevronDown
                className={`w-6 h-6 text-[#2255D7] transition-transform duration-300 flex-shrink-0 ${
                  openFAQ === faq.id ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            <div
              className={`transition-all duration-300 ease-in-out ${
                openFAQ === faq.id
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className='px-6 pb-6 pt-2 border-t border-gray-100'>
                <p className='text-gray-600 leading-relaxed'>
                  {faq.fullContent}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className='flex flex-col items-center gap-4 mt-16'>
        <p className='text-primary text-sm font-normal'>Still have questions?</p>
        <button className='bg-cta hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl'>
          Contact our team
        </button>
      </div>
    </div>
  )
}

export default FAQs