import React, { useState, useEffect, useRef } from 'react'
import {   Send, 
  User, 
  Search, 
  MessageCircle, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Pencil, 
  MoreHorizontal, 
  MenuSquare, 
  CircuitBoard } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import GraphicsDes from '../../assets/Images/Graphics Designer.png'
import Proofreader from '../../assets/Images/Proofreader.png'
import Ghostwriter from '../../assets/Images/Ghostwriter.png'
import Messanger from '../../assets/Images/Dakota Milk.png'

const DashViewCl = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. How can I help you today?", sender: "ai" }
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const [isTaskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');
    
  const circleCount = 5;
  const totalMessages = 5;
  const profiles = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" }
  ];

 const [tasks, setTasks] = useState([
    {
      id: 1,
      color: GraphicsDes, 
      job: "Graphics Design",
      duration: "15 Days",
      deadlines: "Due Tomorrow",
      amount: "+$350.00",
      status: "Ongoing"
    },
    {
      id: 2,
      color: Ghostwriter, 
      job: "Ghostwriting",
      duration: "2 weeks",
      deadlines: "In Progress",
      amount: "+$153.00",
      status: "Under Review"
    },
    {
      id: 3,
      color: Proofreader, 
      job: "Proofreading",
      duration: "3 Days",
      deadlines: "Compeleted",
      amount: "+$223.00",
      status: "Completed"
    }
  ]);

  // First message details
  const firstMessage = {
    userName: "Davota Milk",
    amount: "$43.09"
  };
  const [selectedPayment, setSelectedPayment] = useState('mastercard');
  const baseAmount = '$50.00'; // Base amount value
  // Sample wallet data with icons and tags
 const walletData = [
    { id: 1, icon: <Send style={{color:'#A789FF'}}/>, tag: 'Send' },
    { id: 2, icon: <MenuSquare style={{color:'#83DEA4'}}/>, tag: 'Invoices' },
    { id: 3, icon: <MoreHorizontal style={{color:'#436CFB'}}/>, tag: 'More' },
  
  ];
  const StatisticsData = [
    {
        id: 1,
        icon: <CircuitBoard style={{color:'#7468E4', padding:'0.5rem'}} size={40} />,
        count: '2 Running',
        comment: 'Active Projects',
        bgColor: '#EFECFD'
    },
    {
        id: 2,
        icon: <Clock style={{color:'#51D5EC', padding:'0.5rem'}} size={40} />,
        count: '15 Active',
        comment: 'Hired Freelancers',
        bgColor: '#E4F8FB'
    },
    {
        id: 3,
        icon: <Clock style={{color:'#FFB648', padding:'0.4rem'}} size={40} />,
        count: '92% Rate',
        comment: 'Project Success',
        bgColor: '#FDF1E2'
    }
  ];
  // Function to render the appropriate icon based on type


const jobStatistics = [
    {
        id:1,
        head: 'Jobs',
        durations:'',

    }
]
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    // Add user message
    const newUserMessage = { id: messages.length + 1, text: inputValue, sender: "user" }
    setMessages([...messages, newUserMessage])
    
    // Clear input and hide suggestions
    setInputValue("")
    setShowSuggestions(false)
    
    // Simulate AI response
    setTimeout(() => {
      let responseText = ""
      
      // Some canned responses based on possible questions
      if (inputValue.toLowerCase().includes("service")) {
        responseText = "We offer a wide range of freelance services including web development, design, content writing, marketing, and more!"
      } else if (inputValue.toLowerCase().includes("freelancer")) {
        responseText = "You can find freelancers by posting a task and browsing through our talented pool of professionals. You can filter by skills, ratings, and availability."
      } else if (inputValue.toLowerCase().includes("payment")) {
        responseText = "We support multiple payment methods including credit cards, PayPal, and bank transfers. All payments are secured through our escrow system."
      } else if (inputValue.toLowerCase().includes("task")) {
        responseText = "To create a new task, click on the 'Task' option in the sidebar menu, then click '+ New Task' and fill in the details of your project."
      } else {
        responseText = "Thanks for your question! I'd be happy to help with that. Could you provide more details so I can give you the most relevant information?"
      }
      
      const newAiMessage = { id: messages.length + 2, text: responseText, sender: "ai" }
      setMessages(prevMessages => [...prevMessages, newAiMessage])
    }, 1000)
  }
  
  const handleSuggestionClick = (question) => {
    setInputValue(question)
    handleSendMessage({ preventDefault: () => {} })
  }


const [activeTooltip, setActiveTooltip] = useState(null);
  
// Updated data for earnings/spending instead of hours
const dailyData = [
  { day: 'Mon', earnings: 125 },
  { day: 'Tue', earnings: 340 },
  { day: 'Wed', earnings: 89 },
  { day: 'Thu', earnings: 456 },
  { day: 'Fri', earnings: 278 },
  { day: 'Sat', earnings: 112 },
  { day: 'Sun', earnings: 203 }
];

const weeklyData = [
  { day: 'Week 1', earnings: 1250 },
  { day: 'Week 2', earnings: 1680 },
  { day: 'Week 3', earnings: 945 },
  { day: 'Week 4', earnings: 2150 }
];

const monthlyData = [
  { day: 'Jan', earnings: 4500 },
  { day: 'Feb', earnings: 3890 },
  { day: 'Mar', earnings: 5240 },
  { day: 'Apr', earnings: 6780 },
  { day: 'May', earnings: 4320 },
  { day: 'Jun', earnings: 5890 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-gray-600">{`${label}`}</p>
        <p className="text-green-600 font-semibold">{`Spending: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};


  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = {
    daily: { label: 'This Week', data: dailyData, maxY: 500 },
    weekly: { label: 'This Month', data: weeklyData, maxY: 2500 },
    monthly: { label: 'This Year', data: monthlyData, maxY: 8000 }
  };


 const currentData = periods[selectedPeriod];

  // Handle mouse events for tooltip position
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

 const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  };

  const statusStyles = {
  "Ongoing": "bg-[#FFF1ED] text-[#FFAA90]",
  "Under Review": "bg-[#DBEAFE] text-[#2563EB]", 
  "Completed": "bg-[#EBFFF3] text-[#61BB84]",
  "Cancelled": "bg-gray-100 text-gray-500",
  "On Hold": "bg-orange-100 text-orange-500",
  "Review": "bg-purple-100 text-purple-500"
};


return (
  <div className="w-full border-t flex justify-center items-center border-gray-200 mb-6">
    <div className='flex flex-col py-6 w-full'>
      {/* First Section - Mobile: Stack vertically, Desktop: Horizontal */}
      <section className='flex flex-col lg:flex-row lg:h-[60vh] py-6 px-6 justify-center gap-4'>
        
        {/* Wallet Section */}
        <div className="w-full lg:w-80 h-auto lg:h-3/4 flex flex-col p-5 bg-white rounded-lg border-2 border-[#E8E8E8] hover:shadow-lg">
          <h2 className="text-xl font-semibold basic-font text-dark mb-4">My Wallet</h2>
          
          {/* Balance Section with Payment Method */}
          <div className="flex flex-row justify-between items-center mb-4 py-2 mt-2 px-2 rounded-lg border-1 border-[#F6F8FB]">
            <div className="flex flex-row justify-center items-center">
              <div className="relative flex justify-center items-center mr-8">
                <div className="w-5 h-5 bg-red-600 rounded-full absolute left-0"></div>
                <div className="w-5 h-5 bg-yellow-500 rounded-full absolute left-2 mix-blend-multiply"></div>
                <p className="text-[#798BA3] basic-font ml-9">Balance</p>
              </div>
            </div>
            <div className="flex flex-row items-center rounded-md px-2 py-1">
              <p className="mr-1 font-medium basic-font">$11.25</p>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          
          {/* Input with Dollar Sign Inside */}
          <div className="relative w-full mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input 
              placeholder="Enter Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-8 rounded-lg bg-gray-50 text-sm font-normal border-2 border-[#3a8dff] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Payment Methods Grid */}
          <div className="grid grid-cols-3 gap-2">
            {walletData.map((wallet) => (
              <div 
                key={wallet.id} 
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${selectedPayment === wallet.icon ? 'bg-gray-100 ring-1 ring-blue-500' : ''}`}
                onClick={() => (wallet.icon)}
              >
                <div className="h-8 py-6 px-3 rounded-lg flex items-center justify-center border-1 border-[#F6F8FB] cursor-pointer">
                  {(wallet.icon)}
                </div>
                <span className="font-normal text-[12px] basic-font text-[#343744] mt-3 text-center">{wallet.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section - Statistics & Chart */}
        <div className="w-full lg:w-[60%] px-0 lg:px-4 py-1 mx-0 lg:mx-4 flex-grow">
          
          {/* Statistics Section */}
          <div className="w-full h-auto lg:h-2/6 p-4 bg-white rounded-lg shadow-3 shadow-lg mb-4 lg:mb-0">
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-semibold text-dark basic-font mb-4">Account Statistics</h2>
              
              {/* Mobile: Single column, Desktop: 3-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {StatisticsData.map((stat, index) => (
                  <div key={index} className="flex flex-row items-center group gap-2 cursor-pointer">
                    <div className="rounded-full" style={{ backgroundColor: stat.bgColor }}>
                      {stat.icon}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-lg font-medium text-gray-800 basic-font text-dark">{stat.count}</div>
                      <div className="text-sm text-gray-500 whitespace-nowrap new-font text-[#798BA3]">{stat.comment}</div>
                    </div>
                    
                    {/* Animated underline*/}
                    <div className="absolute bottom-0 left-0 w-full h-0.5">
                      <div className="h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional statistics content */}
              <div className="mt-auto pt-6 bg-white"></div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="w-full max-w-8xl basic-font mx-auto">
            <div className="w-full bg-white rounded-lg shadow-lg mt-2 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
                <div className="flex items-center">
                  <h2 className="text-[1.2rem] font-bold text-[#0F172A]">Project Progress</h2>
                </div>
                <div className='flex flex-col sm:flex-row justify-center items-start sm:items-center gap-3'> 
                  <div className=''>
                    <h3>Completion Rate</h3>
                  </div>
                  <div className="ml-0 sm:ml-auto">
                    <div className="relative inline-block text-left">
                      <div 
                        className="px-4 py-1 flex items-center cursor-pointer hover:bg-gray-50 rounded"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className="mr-2">{currentData.label}</span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedPeriod === 'daily' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                              onClick={() => handlePeriodSelect('daily')}
                            >
                              This Week (Daily)
                            </button>
                            <button
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedPeriod === 'weekly' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                              onClick={() => handlePeriodSelect('weekly')}
                            >
                              This Month (Weekly)
                            </button>
                            <button
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedPeriod === 'monthly' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                              onClick={() => handlePeriodSelect('monthly')}
                            >
                              This Year (Monthly)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={currentData.data}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                      domain={[0, currentData.maxY]}
                      tickFormatter={(tick) => `$${tick}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      fill="url(#colorEarnings)" 
                      activeDot={{ 
                        r: 8, 
                        stroke: 'white', 
                        strokeWidth: 2, 
                        fill: '#10B981' 
                      }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="w-full lg:w-80 h-auto lg:h-3/4 flex flex-col p-4 bg-white rounded-lg bg=[#F2F2F2]">
          <div className='flex flex-col'>
            <div className='flex flex-row justify-between'>
              <h2 className="text-xl font-normal text-[1rem] basic-font text-dark mb-4">Freelancer Messages</h2>   
              <div className='flex flex-row gap-2'>
                <Pencil style={{color:'#7D8DA6'}} size={16}/>
                <Search size={16}/>
              </div>
            </div>
            <div>
              <p className='text-[#7D8DA6] new-font text-[1rem]'>18 recipients</p>
            </div>
          </div>
          
          <div className="flex flex-row w-full mt-5 items-center">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: circleCount }).map((_, index) => (
                <div key={index} className="flex flex-col items-center group">
                  <div 
                    className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center mb-1"
                  >
                    <span className="text-gray-400 text-xs">{index + 1}</span>
                  </div>
                  <div className="h-0.5 w-0 bg-primary rounded-lg transition-all duration-300 group-hover:w-full"></div>
                </div>
              ))}
            </div>
            <div className="ml-3 group-hover:text-[#1e1e2f]">
              <ChevronRight size={16} color="#7D8DA6" />
            </div>
          </div>

          {/* New Messages Section */}
          <div className="flex flex-col w-full h-auto lg:h-[18vh] bg-white rounded-lg shadow-lg mt-4 p-3">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium basic-font text-[1rem]">
                <span className='text-[#7C8CA6]'>New</span> Messages
              </h2>
              
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
                
                <div className="rounded-full border-[#DDE5F0] p-2 border-1 text-xs text-[#FF3D00] font-medium">
                  +{totalMessages}
                </div>
                
                <div className="relative">
                  <MessageCircle size={20} color="#BCCDE1" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                </div>
              </div>
              
              <div className="flex flex-row justify-between items-center mt-3 p-3 rounded-md">
                <div className="col-span-1 flex items-center justify-center">
                  <div 
                    className="w-10 h-10 rounded-full" 
                    style={{ backgroundImage: `url(${Messanger})`, backgroundPosition:'center', backgroundRepeat:'no-repeat', backgroundSize:'cover'}}
                  ></div>
                </div>
                
                <div className="flex flex-col flex-grow mx-3">
                  <h3 className="font-normal basic-font text-dark text-[0.8rem]">{firstMessage.userName}</h3>
                  <p className="text-sm text-[#7D8DA6] basic-font text-[0.8rem]">{firstMessage.amount}</p>
                </div>
                
                <div className="cursor-pointer">
                  <ChevronRight size={20} color="#7D8DA6" />
                </div>
              </div>
            </div>
          </div>
        </div>             
      </section>

      {/* Second Section - Tasks Table */}
      <section className='flex flex-col lg:flex-row justify-center mt-6 h-auto lg:h-[40vh] gap-4'>
        <div className='w-full lg:w-[70%] flex flex-col pt-8'>
          <div className="w-full p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center ml-0 lg:ml-18 px-2 lg:px-6 mb-6 gap-4 sm:gap-0">
              <h2 className="text-lg font-medium border-b-3 border-[#35C9B7] pb-1 basic-font ml-0 lg:ml-8">My Tasks</h2>
              <button className="flex items-center text-[#5E636A] new-font text-sm">
                View all
                <ChevronRight size={18}/>
              </button>
            </div>
            
            <div className="w-full overflow-x-auto">
              {/* Mobile: Hide table headers, show as cards */}
              {/* Desktop: Show as table */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-6 gap-4 pb-3">
                  <div className="col-span-1 text-center text-dark basic-font font-medium">Freelancers</div>
                  <div className="col-span-1 text-dark basic-font font-medium">Jobs Description</div>
                  <div className="col-span-1 text-dark basic-font font-medium">Durations</div>
                  <div className="col-span-1 text-dark basic-font font-medium">Deadline</div>
                  <div className="col-span-1 text-dark basic-font font-medium">Budgets</div>
                  <div className="col-span-1 text-dark basic-font font-medium">Status</div>
                </div>
              </div>
              
              {/* Table Body / Cards */}
              <div className="flex flex-col gap-4 lg:gap-0">
                {tasks.map((task) => (
                  <div key={task.id} className="lg:grid lg:grid-cols-6 lg:gap-4 lg:py-4 lg:border-b lg:border-gray-100 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none shadow-md lg:shadow-none">
                    
                    {/* Mobile Card Layout */}
                    <div className="lg:hidden">
    <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
    <div 
      className="w-12 h-12 rounded-full" 
      style={{ backgroundImage: `url(${task.color})`, backgroundPosition:'center', backgroundRepeat:'no-repeat', backgroundSize:'cover'}}
      ></div>
      <div>
      <h3 className="font-medium text-jobs basic-font">{task.job}</h3>
      <p className="text-sm text-gray-500">{task.duration}</p>
      </div>
      </div>
      <span className={`px-3 py-1 rounded-lg basic-font text-xs ${statusStyles[task.status] || "bg-blue-100 text-blue-500"}`}>
      {task.status}
      </span>
      </div>
      <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">Deadline: {task.deadlines}</span>
      <span className="font-medium text-jobs basic-font">{task.amount}</span>
      </div>
      </div>

                    {/* Desktop Table Layout */}
      <div className="hidden lg:contents">
      <div className="col-span-1 flex items-center justify-center">
      <div 
                          className="w-10 h-10 rounded-full" 
                          style={{ backgroundImage: `url(${task.color})`, backgroundPosition:'center', backgroundRepeat:'no-repeat', backgroundSize:'cover'}}
                        ></div>
                      </div>
                      <div className="col-span-1 flex items-center text-jobs basic-font">{task.job}</div>
                      <div className="col-span-1 flex items-center text-jobs basic-font">{task.duration}</div>
                      <div className="col-span-1 flex items-center text-jobs basic-font">{task.deadlines}</div>
                      <div className="col-span-1 flex items-center font-medium text-jobs basic-font">{task.amount}</div>
                      <div className="col-span-1 flex items-center">
                        <span className={`px-4 py-2 rounded-lg basic-font text-xs ${statusStyles[task.status] || "bg-blue-100 text-blue-500"}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - hidden on mobile */}
        <div className='hidden lg:flex w-[30%] justify-center items-center'>
          <div className="w-full md:w-80 h-3/4 flex flex-col p-4 bg-white rounded-lg shadow-lg hover:shadow-lg">
            {/* Content for right sidebar */}
          </div>
        </div>
      </section>
    </div>
  </div>
)
}


export default DashViewCl