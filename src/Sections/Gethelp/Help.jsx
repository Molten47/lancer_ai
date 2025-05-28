import React, { useState } from 'react'
import { Search, FileText, DollarSign, Settings, Shield, Users, BarChart3, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

const GetHelp = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(0)

  const helpCategories = [
    {
      id: 1,
      title: 'Getting Started',
      description: 'Learn the basics and get up to speed',
      articles: '12 articles',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Payments & Billing',
      description: 'Manage your payment and invoices',
      articles: '8 articles',
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Payments & Billing',
      description: 'Manage your payment and invoices',
      articles: '8 articles',
      icon: Settings,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      id: 4,
      title: 'Security',
      description: 'Keep your account safe and secured',
      articles: '6 articles',
      icon: Shield,
      color: 'bg-red-50 text-red-600',
      iconBg: 'bg-red-100'
    },
    {
      id: 5,
      title: 'Working with Clients',
      description: 'Tips for successful collaboration',
      articles: '15 articles',
      icon: Users,
      color: 'bg-yellow-50 text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      id: 6,
      title: 'Project Management',
      description: 'Organize and manage your work',
      articles: '9 articles',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-600',
      iconBg: 'bg-indigo-100'
    }
  ]

  const faqs = [
    {
      id: 1,
      question: 'How does the payment system work?',
      answer: 'We use a secure escrow system. Clients deposit funds before work begins, and payment is released to you once the work is completed and approved. We support multiple payment methods including bank transfers and PayPal.'
    },
    {
      id: 2,
      question: 'How do I get started as a freelancer?',
      answer: 'Getting started is easy! First, complete your profile with your skills and portfolio. Then browse available projects or wait for clients to contact you directly. Make sure to set competitive rates and respond quickly to inquiries.'
    },
    {
      id: 3,
      question: 'What fees does Lancer charge?',
      answer: 'Lancer charges a service fee based on your lifetime billings with each client. The fee starts at 20% and decreases as you bill more with the same client, going as low as 5% for long-term relationships.'
    },
    {
      id: 4,
      question: 'How do I communicate with clients?',
      answer: 'You can communicate with clients through our built-in messaging system, video calls, or file sharing. All communication is tracked and secured within the platform for your protection.'
    },
    {
      id: 5,
      question: 'What if there\'s a dispute with a client?',
      answer: 'If you have a dispute, our mediation team will step in to help resolve the issue fairly. We review all project communications and deliverables to make an informed decision.'
    }
  ]

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? 0 : id)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <p className="text-gray-600 text-lg mb-8">Search our knowledge base or browse categories below</p>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Help Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {helpCategories.map((category) => {
          const IconComponent = category.icon
          return (
            <div
              key={category.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${category.iconBg}`}>
                  <IconComponent size={24} className={category.color.split(' ')[1]} />
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <p className="text-sm text-gray-500">{category.articles}</p>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                {expandedFaq === faq.id ? (
                  <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedFaq === faq.id && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <p className="text-gray-600 leading-relaxed pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Still need help?</h3>
        <p className="text-gray-600 mb-6">Can't find what you're looking for? Our support team is here to help.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Contact Support
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium">
            Submit a Ticket
          </button>
        </div>
      </div>
    </div>
  )
}

export default GetHelp