import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, Bell, User, Settings, Home, BarChart2, FileText, Search, Wallet, PieChart, MessageCircle, Send, AlertCircle, ChevronDown, ChevronUp, Plus, ChevronLeft, ChevronRight, LucideShieldHalf, HardDriveDownload, LockKeyhole, ClipboardPaste, Clipboard, Download, Upload, Clock, Pencil, Star } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import GraphicsDes from '../../assets/Images/Graphics Designer.png';
import Proofreader from '../../assets/Images/Proofreader.png';
import Ghostwriter from '../../assets/Images/Ghostwriter.png';
import Messanger from '../../assets/Images/Dakota Milk.png';

const DashboardView = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", sender: "ai" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const [isTaskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const circleCount = 5;
  const totalMessages = 5;
  const profiles = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" }
  ];

  // Star Rating Component
  const StarRating = ({ rating, showPercentage = false }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={16} className="text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={16} className="text-gray-300" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        {showPercentage && (
          <span className="text-sm text-gray-600 ml-1">
            {Math.round(rating * 20)}%
          </span>
        )}
      </div>
    );
  };

  const [tasks, setTasks] = useState([
    {
      id: 1,
      color: GraphicsDes,
      job: "Graphics Design",
      duration: "15 Days",
      watchtime: "2days 3hrs",
      amount: "+$350.00",
      status: "Pending",
      rating: 0, // No rating for pending tasks
      hasRating: false
    },
    {
      id: 2,
      color: Ghostwriter,
      job: "Ghostwriting",
      duration: "2 weeks",
      watchtime: "-----",
      amount: "+$153.00",
      status: "Success",
      rating: 5.0,
      hasRating: true
    },
    {
      id: 3,
      color: Proofreader,
      job: "Proofreading",
      duration: "3 Days",
      watchtime: "-----",
      amount: "+$223.00",
      status: "Success",
      rating: 4.4,
      hasRating: true
    }
  ]);

  // First message details
  const firstMessage = {
    userName: "Davota Milk",
    amount: "$43.09"
  };
  const [selectedPayment, setSelectedPayment] = useState('mastercard');
  const baseAmount = '$50.00';

  const walletData = [
    { id: 1, icon: <Download style={{ color: '#A789FF' }} />, tag: 'Withdraw' },
    { id: 2, icon: <Upload style={{ color: '#83DEA4' }} />, tag: 'Send' },
    { id: 3, icon: <Upload style={{ color: '#436CFB' }} />, tag: 'More' },
  ];

  const StatisticsData = [
    {
      id: 1,
      icon: <Clock style={{ color: '#7468E4', padding: '0.4rem' }} size={40} />,
      count: 85,
      comment: 'Task Completed',
      bgColor: '#EFECFD'
    },
    {
      id: 2,
      icon: <Clock style={{ color: '#51D5EC', padding: '0.4rem' }} size={40} />,
      count: '$13,000',
      comment: 'Total Earnings',
      bgColor: '#E4F8FB'
    },
    {
      id: 3,
      icon: <Clock style={{ color: '#FFB648', padding: '0.4rem' }} size={40} />,
      count: '85%',
      comment: 'Success Stories',
      bgColor: '#FDF1E2'
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage = { id: messages.length + 1, text: inputValue, sender: "user" };
    setMessages([...messages, newUserMessage]);

    setInputValue("");
    setShowSuggestions(false);

    setTimeout(() => {
      let responseText = "";

      if (inputValue.toLowerCase().includes("service")) {
        responseText = "We offer a wide range of freelance services including web development, design, content writing, marketing, and more!";
      } else if (inputValue.toLowerCase().includes("freelancer")) {
        responseText = "You can find freelancers by posting a task and Browse through our talented pool of professionals. You can filter by skills, ratings, and availability.";
      } else if (inputValue.toLowerCase().includes("payment")) {
        responseText = "We support multiple payment methods including credit cards, PayPal, and bank transfers. All payments are secured through our escrow system.";
      } else if (inputValue.toLowerCase().includes("task")) {
        responseText = "To create a new task, click on the 'Task' option in the sidebar menu, then click '+ New Task' and fill in the details of your project.";
      } else {
        responseText = "Thanks for your question! I'd be happy to help with that. Could you provide more details so I can give you the most relevant information?";
      }

      const newAiMessage = { id: messages.length + 2, text: responseText, sender: "ai" };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
    }, 1000);
  };

  const handleSuggestionClick = (question) => {
    setInputValue(question);
    handleSendMessage({ preventDefault: () => { } });
  };

  const [activeTooltip, setActiveTooltip] = useState(null);

  // Chart data
  const weekData = [
    { day: 'MAY 2', hours: 4, date: 'May 2' },
    { day: 'MAY 3', hours: 6.5, date: 'May 3' },
    { day: 'MAY 4', hours: 6, date: 'May 4' },
    { day: 'MAY 5', hours: 13, date: 'May 5' },
    { day: 'MAY 6', hours: 10, date: 'May 6' },
    { day: 'MAY 7', hours: 12, date: 'May 7' },
    { day: 'MAY 8', hours: 16, date: 'May 8' },
  ];

  const dailyData = [
    { day: '6 AM', hours: 2, date: '6 AM' },
    { day: '9 AM', hours: 4, date: '9 AM' },
    { day: '12 PM', hours: 6, date: '12 PM' },
    { day: '3 PM', hours: 8, date: '3 PM' },
    { day: '6 PM', hours: 5, date: '6 PM' },
    { day: '9 PM', hours: 3, date: '9 PM' },
    { day: '12 AM', hours: 1, date: '12 AM' },
  ];

  const monthlyData = [
    { day: 'JAN', hours: 120, date: 'January' },
    { day: 'FEB', hours: 95, date: 'February' },
    { day: 'MAR', hours: 140, date: 'March' },
    { day: 'APR', hours: 110, date: 'April' },
    { day: 'MAY', hours: 160, date: 'May' },
    { day: 'JUN', hours: 135, date: 'June' },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to get current data based on selected period
  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'Daily': return dailyData;
      case 'Monthly': return monthlyData;
      default: return weekData;
    }
  };

  // Function to get Y-axis domain based on period
  const getYAxisDomain = () => {
    switch (selectedPeriod) {
      case 'Daily': return [0, 10];
      case 'Monthly': return [0, 200];
      default: return [0, 20];
    }
  };

  // Function to format Y-axis ticks based on period
  const formatYAxisTick = (tick) => {
    switch (selectedPeriod) {
      case 'Monthly': return `${tick}h`;
      default: return `${tick}h`;
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dayName = selectedPeriod === 'Monthly' ? payload[0].payload.date : new Date(payload[0].payload.date).toLocaleString('en-US', { weekday: 'short' });
      return (
        <div className="bg-[#0F172A] text-white p-2 rounded-md text-center flex flex-col items-center">
          <p className="text-gray-400 text-sm">{dayName}</p>
          <p className="text-md">{payload[0].value}hrs</p>
        </div>
      );
    }
    return null;
  };

  const handleMouseMove = (e) => {
    if (e && e.activePayload) {
      setActiveTooltip({
        payload: e.activePayload[0].payload,
        x: e.chartX,
        y: e.chartY
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="w-full border-t flex justify-center items-center border-gray-200 mb-6">
      <div className='flex flex-col py-6 w-full '>
        <section className='flex flex-col lg:flex-row h-auto lg:h-[60vh] py-6 px-6 justify-center gap-4'>
          <div className="w-full lg:w-80 h-auto lg:h-3/4 flex flex-col p-5 bg-white rounded-lg border-2 border-[#E8E8E8] hover:shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Wallet</h2>

            <div className="flex flex-row justify-between items-center mb-4 py-2 mt-2 px-2 rounded-lg border border-gray-100">
              <div className="flex flex-row justify-center items-center">
                <div className="relative flex justify-center items-center mr-8">
                  <div className="w-5 h-5 bg-red-600 rounded-full absolute left-0"></div>
                  <div className="w-5 h-5 bg-yellow-500 rounded-full absolute left-2 mix-blend-multiply"></div>
                  <p className="text-gray-600 ml-9">Balance</p>
                </div>
              </div>
              <div className="flex flex-row items-center rounded-md px-2 py-1">
                <p className="mr-1 font-medium">$11.25</p>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="relative w-full mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                placeholder="Enter Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-8 rounded-lg bg-gray-50 text-sm font-normal border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {walletData.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setSelectedPayment(wallet.id)}
                >
                  <div className="h-8 py-6 px-3 rounded-lg flex items-center justify-center border border-gray-100 cursor-pointer">
                    {wallet.icon}
                  </div>
                  <span className="font-normal text-xs text-gray-700 mt-3 text-center">{wallet.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[60%] px-4 py-1 mx-0 lg:mx-4 flex-grow">
            <div className="w-full h-auto lg:h-2/6 p-4 bg-white rounded-lg shadow-lg">
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {StatisticsData.map((stat, index) => (
                    <div key={index} className="flex flex-row items-center group gap-2 cursor-pointer">
                      <div className="rounded-full" style={{ backgroundColor: stat.bgColor }}>
                        {stat.icon}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-lg font-medium text-gray-800">{stat.count}</div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">{stat.comment}</div>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full h-0.5">
                        <div className="h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 bg-white"></div>
              </div>
            </div>

            <div className="w-full bg-white rounded-lg shadow-lg mt-2 p-3">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-900">Work Rate</h2>
                  <div className="ml-auto">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="bg-blue-500 rounded-md p-1">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-2 sm:gap-0">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-1 mr-2">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-normal">Hours Worked</span>
                </div>
                <div className="flex items-center sm:ml-4 text-green-600">
                  <span>+6.79%</span>
                </div>
                <div className="sm:ml-auto">
                  <div className="relative inline-block text-left">
                    <div
                      className="border border-gray-300 rounded-full px-4 py-1 flex items-center cursor-pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="mr-2">{selectedPeriod}</span>
                      {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    {isDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                          {['Week', 'Daily', 'Monthly'].map((period) => (
                            <a
                              key={period}
                              href="#"
                              className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                              role="menuitem"
                              tabIndex="-1"
                              onClick={() => {
                                setSelectedPeriod(period);
                                setIsDropdownOpen(false);
                              }}
                            >
                              {period}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full h-58">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getCurrentData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      domain={getYAxisDomain()}
                      ticks={getYAxisDomain().map((val, index) => index === 0 ? val : val / 4 * (index + 1))} // Adjusted ticks for better scaling
                      tickFormatter={formatYAxisTick}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fill="url(#colorHours)"
                      activeDot={{
                        r: 8,
                        stroke: 'white',
                        strokeWidth: 2,
                        fill: '#2563EB'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 h-auto lg:h-3/4 flex flex-col p-4 bg-white rounded-lg">
            <div className='flex flex-col'>
              <div className='flex flex-row justify-between'>
                <h2 className="text-xl font-normal text-gray-800 mb-4">Recent Messages</h2>
                <div className='flex flex-row gap-2'>
                  <Pencil style={{ color: '#7D8DA6' }} size={16} />
                  <Search size={16} />
                </div>
              </div>
              <div>
                <p className='text-gray-500 text-sm'>18 recipients</p>
              </div>
            </div>

            <div className="flex flex-row w-full mt-5 items-center">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: circleCount }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center group">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                      <span className="text-gray-400 text-xs">{index + 1}</span>
                    </div>
                    <div className="h-0.5 w-0 bg-blue-500 rounded-lg transition-all duration-300 group-hover:w-full"></div>
                  </div>
                ))}
              </div>
              <div className="ml-3">
                <ChevronRight size={16} color="#7D8DA6" />
              </div>
            </div>

            <div className="flex flex-col w-full h-auto lg:h-[18vh] bg-white rounded-lg shadow-lg mt-4 p-3">
              <div className="flex flex-col">
                <h2 className="text-lg font-medium"><span className='text-gray-500'>New</span> Messages</h2>

                <div className="flex flex-row justify-between items-center mt-2">
                  <div className="flex flex-row">
                    {profiles.map((profile, index) => (
                      <div

                        key={profile.id}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white"
                        style={{ marginLeft: index > 0 ? '-10px' : '0' }}
                      >
                        <span className="text-gray-500 text-xs">{profile.id}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-full border-gray-200 p-2 border text-xs text-red-500 font-medium">
                    +{totalMessages}
                  </div>

                  <div className="relative">
                    <MessageCircle size={20} color="#BCCDE1" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center mt-3 p-3 rounded-md">
                  <div className="col-span-1 flex items-center justify-center">
                    <img src={Messanger} alt="" className='h-10 w-10' />
                  </div>

                  <div className="flex flex-col flex-grow mx-3">
                    <h3 className="font-normal text-gray-800 text-sm">{firstMessage.userName}</h3>
                    <p className="text-sm text-gray-500">{firstMessage.amount}</p>
                  </div>

                  <div className="cursor-pointer">
                    <ChevronRight size={20} color="#7D8DA6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='flex flex-col justify-center mt-6 h-auto px-6'>
          <div className='w-full flex flex-col pt-8'>
            <div className="w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium border-b-2 border-teal-400 pb-1">My Tasks</h2>
                <button className="flex items-center text-gray-600 text-sm hover:text-gray-800">
                  View all
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                {/* Enhanced Table Header with Rating column */}
                <div className="hidden md:grid grid-cols-7 gap-4 pb-3 border-b border-gray-200">
                  <div className="col-span-1"></div>
                  <div className="col-span-1 text-gray-800 font-medium">Job Description</div>
                  <div className="col-span-1 text-gray-800 font-medium">Durations</div>
                  <div className="col-span-1 text-gray-800 font-medium">Timeleft</div>
                  <div className="col-span-1 text-gray-800 font-medium">Amount</div>
                  <div className="col-span-1 text-gray-800 font-medium">Status</div>
                  <div className="col-span-1 text-gray-800 font-medium">Client Rating</div>
                </div>

                {/* Enhanced Table Body with Rating */}
                <div className="flex flex-col">
                  {tasks.map((task) => (
                    <div key={task.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Mobile Layout Enhanced */}
                      <div className="md:hidden flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-300"
                            style={{ backgroundImage: `url(${task.color})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
                          ></div>
                          <div className="flex-grow">
                            <div className="text-lg font-medium text-gray-800">{task.job}</div>
                            <div className="text-sm text-gray-600">{task.duration}</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === "Pending" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                            }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Watchtime: {task.watchtime}</span>
                          <span className="font-medium text-gray-800">{task.amount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Rating:</span>
                          {task.hasRating ? (
                            <StarRating rating={task.rating} showPercentage={true} />
                          ) : (
                            <span className="text-gray-400 text-sm">No Rating</span>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout Enhanced */}
                      <div className="hidden md:contents">
                        <div className="col-span-1 flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-full bg-gray-300"
                            style={{ backgroundImage: `url(${task.color})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
                          ></div>
                        </div>
                        <div className="col-span-1 flex items-center text-gray-800 font-medium">{task.job}</div>
                        <div className="col-span-1 flex items-center text-gray-600">{task.duration}</div>
                        <div className="col-span-1 flex items-center text-gray-600">{task.watchtime}</div>
                        <div className="col-span-1 flex items-center font-medium text-gray-800">{task.amount}</div>
                        <div className="col-span-1 flex items-center">
                          <span className={`px-4 py-2 rounded-lg text-xs font-medium ${
                            task.status === "Pending" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                            }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center">
                          {task.hasRating ? (
                            <StarRating rating={task.rating} showPercentage={true} />
                          ) : (
                            <span className="text-gray-400 text-sm">No Rating</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardView;