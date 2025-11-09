import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'

const FAQs = () => {
  const [openItems, setOpenItems] = useState({})

  const faqContents = [
    {
      id: 1,
      topContent: 'What is Lancer?',
      fullContent: 'Lancer is an AI-powered business lifecycle platform that helps you build teams, manage workflows, and get projects done efficiently that business love and boost team productivity.'
    },
    {
      id: 2,
      topContent: 'How does Lancer work for me?',
      fullContent: 'For Clients: Lancer helps you setup a project, build a team and manage the project until completion with AI Project Assistant, Client Assistant and Job Assistant.\n\nFor Freelancers: Lancer provides freelancers with clients in need of specific skills, helping freelancers get hired on our platform.'
    },
    {
      id: 3,
      topContent: 'What makes Lancer different?',
      fullContent: 'We are the only platform that handles the full project or business lifecycle from client initial idea, to hiring a team (either in-house or freelancers from our pool) and managing their project to completion.'
    },
    {
      id: 4,
      topContent: 'What stage is the product development?',
      fullContent: 'We are currently in the Minimum Viable Product Development stage, building core features based on user feedback and market needs.'
    }
  ]

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className='w-full bg-[#FFFFFF] flex flex-col items-center justify-start py-8 sm:py-12 md:py-14 lg:py-16 min-h-[80vh] px-4 sm:px-6 md:px-8'>
      {/* Header Section */}
      <div className='flex flex-col justify-center text-center items-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12 px-4'>
          <span className='bg-[#F3F4F6] py-2 px-4 sm:px-5 text-[#151B25] rounded-lg border border-[#E5E7EB] text-sm sm:text-base font-medium'>
            FAQ
          </span>
        <h2 className='font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-[#151B25]'>
          Got questions about Lancer?
        </h2>
        <p className='text-[#151B25] text-sm sm:text-base md:text-base'>We've got answers.</p>
      </div>

      {/* FAQ Cards - Dropdown Display */}
      <div className='w-full max-w-4xl flex flex-col gap-4 mb-6 sm:gap-5 md:gap-6'>
        {faqContents.map((faq) => (
          <div
            key={faq.id}
            className='bg-white border-2 border-[#2255D7] rounded-lg py-2 overflow-hidden'
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className='w-full p-5 sm:p-6 md:p-7 lg:p-8 flex items-center justify-between text-left hover:bg-gray-50 transition-colors'
            >
              <h3 className='text-[#111827] font-semibold text-lg sm:text-xl md:text-xl pr-4'>
                {faq.topContent}
              </h3>
              <ChevronRight
                className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-[#4B5563] transition-transform duration-300 ${
                  openItems[faq.id] ? 'rotate-270' : ''
                }`}
              />
            </button>
            
            <div
              className={`transition-all duration-300 ease-in-out ${
                openItems[faq.id] 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className='px-5 sm:px-6 md:px-7 lg:px-8 pb-5 sm:pb-6 md:pb-7 lg:pb-8 pt-0'>
                <p className='text-[#4B5563] text-sm sm:text-base md:text-base leading-relaxed whitespace-pre-line'>
                  {faq.fullContent}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='max-w-4xl flex flex-col gap-2 my-8 justify-center items-center'>
        <p className='text-[#151B25] text-sm font-normal'>Still have questions?</p>
        <button className='bg-[#2255D7] text-white max-w-xl px-7 rounded-lg shadow-lg shadow-[#2255D7]/50 py-3 font-medium'>Contact our team</button>
      </div>
    </div>
  )
}

export default FAQs