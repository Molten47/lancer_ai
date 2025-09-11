import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log('Subscribing email:', email);
    // Reset form or show success message
    setEmail('');
  };

  return (
    <div className="w-full bg-gray-50 py-16 px-6 basic-font">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 gap-2">
          <h2 className="text-2xl md:text-xl font-medium text-primary mb-4">
            Get AI-Powered Freelancing Tips
          </h2>
          <p className="text-[#6B7280] text-lg md:text-sm max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest updates, industry trends, and expert analysis.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Newsletter Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center hover:shadow-md transition-shadow duration-300">
            <div className="w-16 h-16  rounded-lg flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-[1rem] font-medium text-primary mb-3">
              Newsletter
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Weekly curated insights and updates delivered to your inbox
            </p>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-lg  border-[#E5E7EB] p-8 text-center hover:shadow-md transition-shadow duration-300">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-light" />
            </div>
            <h3 className="text-[1rem] font-medium text-primary mb-3">
              Alerts
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Real-time notifications for important industry developments
            </p>
          </div>

          {/* Reports Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center hover:shadow-md transition-shadow duration-300">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-[1rem] font-medium text-primary mb-3">
              Reports
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Access to exclusive industry reports and analysis
            </p>
          </div>
        </div>

        {/* Subscription Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-2 font-normal px-6 py-4 bg-[#151B25] text-white placeholder-[#FFFFFF] rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 text-sm hover:shadow-2xs whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSubscription;