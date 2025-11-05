import React, { useState } from 'react'

const FAQs = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

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

  return (
    <div className='w-full bg-[#1F2937] flex flex-col items-center justify-start py-12 sm:py-16 min-h-screen third-font px-4'>
      {/* Header Section */}
      <div className='flex flex-col justify-center text-center items-center gap-3 mb-12'>
        <h2 className='font-semibold text-3xl text-white'>
          Frequently Asked Questions
        </h2>
        <p className='text-white text-base'>Everything you need to know about Lancer</p>
      </div>

      {/* FAQ Cards - Static Display */}
      <div className='w-full max-w-3xl flex flex-col gap-6'>
        {faqContents.map((faq) => (
          <div
            key={faq.id}
            className='bg-white rounded-lg p-8'
          >
            <h3 className='text-[#111827] font-semibold text-xl mb-4'>
              {faq.topContent}
            </h3>
            <p className='text-[#4B5563] text-base leading-relaxed whitespace-pre-line'>
              {faq.fullContent}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQs