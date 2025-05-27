import { useState } from 'react';
import { ChevronDown, Download, Upload, RefreshCcw, ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye } from 'lucide-react';

const Wallet = () => {
  const [amount, setAmount] = useState('1.24');
  const [selectedPayment, setSelectedPayment] = useState('mastercard');

  const walletData = [
    { id: 1, icon: <Download className="w-5 h-5" style={{color:'#A789FF'}}/>, tag: 'Withdraw' },
    { id: 2, icon: <Upload className="w-5 h-5" style={{color:'#83DEA4'}}/>, tag: 'Send' },
    { id: 3, icon: <MoreHorizontal className="w-5 h-5" style={{color:'#436CFB'}}/>, tag: 'More' },
  ];

  const transactions = [
    {
      id: 1,
      title: 'Website Design Project',
      time: 'Today, 12:45 PM',
      amount: '+$850',
      status: 'Completed',
      type: 'income',
      icon: <ArrowUpRight size={24} className="text-[#4CAF50]" />
    },
    {
      id: 2,
      title: 'Withdrawal to Bank',
      time: 'Yesterday, 3:30 PM',
      amount: '-$150',
      status: 'Processed',
      type: 'expense',
      icon: <ArrowDownRight size={24} className="text-[#FF3D00] " />
    },
    {
      id: 3,
      title: 'Video Animations',
      time: 'Today, 12:45 PM',
      amount: '+$430',
      status: 'Completed',
      type: 'income',
      icon: <ArrowUpRight size={24} className="text-[#4CAF50]" />
    },
    {
      id: 4,
      title: 'Shopify Landing Page',
      time: 'Today, 12:45 PM',
      amount: '+$300',
      status: 'Completed',
      type: 'income',
      icon: <ArrowDownRight size={24} className="text-[#FF3D00]" />
    }
  ];

  return (
    <div className="p-6 bg min-h-screen basic-font">
      <div className="flex flex-col gap-6">
        {/* Top Section */}
        <div className="flex gap-6 h-90">
          {/* Total Income Card */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-6 h-full shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-dark text-[1.2rem] font-medium  mb-2">Total Income</h2>
                  <h3 className="text-3xl font-semibold text-dark">$10,432</h3>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg">
                  <RefreshCcw className="w-5 h-5 text-gray-400"/>
                </button>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-[#F0FDF4] rounded-lg p-4 pb-18">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight size={26} className="font-bold text-[#4CAF50]"/>
                    <span className="text-[#4CAF50] text-sm font-semibold text-[1.25rem]">Income</span>
                  </div>
                  <div className="text-xl font-semibold text-dark text-[1.25rem] mb-1">$2,800</div>
                  <div className="text-gray-500 text-sm">This month</div>
                </div>
                
                <div className="flex-1 bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight size={26} className="font-bold text-[#FF3D00]"/>
                    <span className="text-[#FF3D00] text-sm font-semibold text-[1.25rem]">Spending</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">$1,200</div>
                  <div className="text-gray-500 text-sm">This month</div>
                </div>
              </div>
            </div>
          </div>

          {/* My Wallet Card */}
          <div className="w-80 h-full">
            <div className="bg-white rounded-xl p-6 h-full shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">My Wallet</h2>
              
              {/* Balance Section */}
              <div className="flex justify-between items-center mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="relative flex justify-center items-center mr-8">
                     <div className="w-5 h-5 bg-red-600 rounded-full absolute left-0"></div>
                    <div className="w-5 h-5 bg-yellow-500 rounded-full absolute left-2 mix-blend-multiply"></div>
                  </div>
                  <span className="text-[#798BA3] text-[0.9rem]">Balance</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-normal text-[0.9rem] text-[#343744]">$1,600</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {/* Amount Input */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-gray-400 text-lg">$</span>
                </div>
                <input 
                  placeholder="Enter amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-8 text-lg font-medium bg-blue-50 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">

                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {walletData.map((wallet) => (
                  <div 
                    key={wallet.id} 
                    className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center mb-2">
                      {wallet.icon}
                    </div>
                    <span className="text-xs text-gray-600 text-center">{wallet.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Transactions Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              View all
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
          
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {transaction.icon}
                  </div>
                  <div>
                    <div className="font-medium text-dark text-[1.2rem] mb-1">{transaction.title}</div>
                    <div className="text-sm text-gray-500">{transaction.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium text-[1rem] mb-1 ${transaction.type === 'income' ? 'text-[#4CAF50]' : 'text-[#FF3D00]'}`}>
                    {transaction.amount}
                  </div>
                  <div className="text-[0.9rem] text-[#6B7280]">{transaction.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;