import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQs = () => {
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqContents = [
    {
      id: 1,
      topContent: 'Why is Lancer different from other BPM and Project management platform?',
      fullContent: 'Lancer isn\'t a marketplace or just another project management tool. It combines project execution, recruitment, and collaboration on one platform, powered by agentic AI.'
    },
    {
      id: 2,
      topContent: 'When will Lancer launch?',
      fullContent: 'Lancer is currently in development, with the MVP product being built. We\'re working hard to deliver the best experience possible, and the official launch will be announced soon. Stay tuned!'
    },
    {
      id: 3,
      topContent: 'Is Lancer free to use?',
      fullContent: 'Lancer is not free. It operates on a subscription model with tiered pricing based on usage and features. This way, individuals, teams, and organizations can choose the plan that best fits their project needs—starting with limited free access and scaling up as they grow.'
    },
    {
      id: 4,
      topContent: 'What types of skills and industries does Lancer support?',
      fullContent: 'Lancer is designed for both digital talent and business owners. On one side, it supports individuals with digital and IT skills—such as developers, designers, data scientists, and marketer e.t.c On the other side, it empowers startups, entrepreneurs, and organizations to easily recruit, manage, and collaborate with these talents on projects of any size. Whether you\'re building, scaling, or hiring, Lancer bridges the gap between skill and business need.'
    },
    {
      id: 5,
      topContent: 'How does the skill assessment work?',
      fullContent: 'Freelancers signing up for the platform undergo a two-phase evaluation process. First, they participate in an AI-conducted interview assessing their experience, tools, task approach, and soft skills like collaboration and communication. The AI scores them from 0 to 10. Next, in the Onboarding Job phase, freelancers with similar skills are grouped and tested over an extended period (e.g., two weeks) on individual skills and team performance. An AI client assigns tasks, reviews submissions, and evaluates performance. The final ranking, from Beginner to Expert, is determined by combining the interview score (less weighted) with the Onboarding Job grade.'
    }
  ]

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className='w-full bg-[#F3F4F6] flex flex-col items-center justify-start py-12 sm:py-16 min-h-[80vh] basic-font px-4'>
      {/* Header Section */}
      <div className='flex flex-col justify-center text-center items-center gap-4 sm:gap-6 mb-8 sm:mb-12'>
        <span className='text-gray-800 px-4 sm:px-6 py-2 text-xs sm:text-sm bg-gray-50 border-2 border-gray-200 rounded-lg font-medium'>
          FAQ
        </span>
        <h2 className='font-medium text-xl sm:text-2xl max-w-3xl text-primary px-4'>
          Got questions about Lancer?
          <br />
          We've got answers.
        </h2>
      </div>

      {/* FAQ Accordion Section */}
      <div className='w-full max-w-5xl px-4 sm:px-6'>
        {faqContents.map((faq) => (
          <div
            key={faq.id}
            className='mb-3 sm:mb-4 border-2 border-[#2255D7] rounded-lg bg-white overflow-hidden transition-all duration-300 ease-in-out'
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className='w-full px-4 sm:px-6 py-5 sm:py-7 text-left flex justify-between items-center hover:bg-blue-50 transition-colors duration-200'
            >
              <span className='text-primary font-normal text-sm sm:text-base md:text-[1rem] pr-3 sm:pr-4'>
                {faq.topContent}
              </span>
              <ChevronDown
                className={`w-5 h-5 sm:w-6 sm:h-6 text-[#2255D7] transition-transform duration-300 flex-shrink-0 ${
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
              <div className='px-4 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-gray-100'>
                <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                  {faq.fullContent}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className='flex flex-col items-center gap-3 sm:gap-4 mt-12 sm:mt-16 px-4'>
        <p className='text-primary text-sm font-normal'>Still have questions?</p>
        <button className='bg-cta hover:bg-blue-700 text-white px-8 sm:px-10 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base'>
          Contact our team
        </button>
      </div>
    </div>
  )
}

export default FAQs