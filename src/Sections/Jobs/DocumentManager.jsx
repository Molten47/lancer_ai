import React, { useState } from 'react';
import { ChevronLeft, Grid3X3, List, Plus, Download, Folder, Briefcase, FileText, File, Image, Package, Search, FileSpreadsheet, EllipsisVertical, ArrowLeft } from 'lucide-react';

export default function FileManager() {
  const [currentView, setCurrentView] = useState('root');
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');

  const fileStructure = {
    root: {
      name: 'Job Folder',
      type: 'folder',
      folders: [
        {
          id: 'project-req',
          name: 'Project Requirements',
          fileCount: 3,
          lastUpdated: '2023-05-15',
          files: [
            { id: 1, name: 'Initial Requirements.docx', size: '245 KB', date: '2023-05-10', type: 'doc' },
            { id: 2, name: 'Technical Specifications.pdf', size: '1.2 MB', date: '2023-05-12', type: 'pdf' },
            { id: 3, name: 'User Stories.xlsx', size: '380 KB', date: '2023-05-15', type: 'sheet' }
          ]
        },
        {
          id: 'client-assets',
          name: 'Client Assets',
          fileCount: 5,
          lastUpdated: '2023-06-12',
          files: [
            { id: 1, name: 'Logo.png', size: '120 KB', date: '2023-05-01', type: 'image' },
            { id: 2, name: 'Brand Guideline.pdf', size: '1.2 MB', date: '2023-05-12', type: 'pdf' },
            { id: 3, name: 'Product Photos.zip', size: '15 MB', date: '2023-06-01', type: 'zip' },
            { id: 4, name: 'Banner Images.zip', size: '8.3 MB', date: '2023-06-02', type: 'zip' },
            { id: 5, name: 'Color Palette.png', size: '5 MB', date: '2023-06-02', type: 'image' }
          ]
        },
        {
          id: 'contracts',
          name: 'Contracts',
          fileCount: 2,
          lastUpdated: '2023-04-28',
          files: [
            { id: 1, name: 'Service Agreement.pdf', size: '850 KB', date: '2023-04-15', type: 'pdf' },
            { id: 2, name: 'NDA.docx', size: '320 KB', date: '2023-04-28', type: 'doc' }
          ]
        }
      ]
    },
    jobs: [
      {
        id: 'damilare',
        name: 'Damilare Alabi',
        role: 'Operation Manager',
        lastEdited: '2023-06-10',
        fileCount: 3,
        files: [
          { id: 1, name: 'Meeting Notes.docx', size: '180 KB', date: '2023-06-05', type: 'doc' },
          { id: 2, name: 'Client Feedback.pdf', size: '750 KB', date: '2023-06-08', type: 'pdf' },
          { id: 3, name: 'Project Timeline.xlsx', size: '450 KB', date: '2023-06-05', type: 'sheet' }
        ]
      },
      {
        id: 'ocheje',
        name: 'Ocheje Sunday',
        role: 'Inventory Specialist',
        lastEdited: '2023-06-15',
        fileCount: 0,
        files: []
      },
      {
        id: 'hephzibah',
        name: 'Hephzibah Ilori',
        role: 'Customer Support Lead',
        lastEdited: '2023-06-12',
        fileCount: 0,
        files: []
      }
    ]
  };

  const getFileIcon = (type) => {
    const icons = {
      doc: <FileText size={20} className='text-[#3B82F6]' />,
      pdf: <File size={20} className='text-[#EF4444]' />,
      sheet: <FileSpreadsheet size={20} className='text-[#22C55E]' /> ,
      image: <Image size={20} className='text-purple-500' />,
      zip: <Package size={20} className='text-orange-500' />
    };
    return icons[type] || <File size={32} className='text-gray-500' />;
  };

  const renderRootFolders = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
      {fileStructure.root.folders.map((folder) => (
        <div
          key={folder.id}
          onClick={() => { setCurrentView(folder.id); setActiveTab('root'); }}
          className={`bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition ${
            viewMode === 'grid' 
              ? 'p-5 flex flex-col items-center text-center' 
              : 'p-4 flex items-center gap-3'
          }`}
        >
          {viewMode === 'grid' ? (
            <>
              <div className="mb-3 flex justify-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Folder size={32} className='text-blue-600' />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{folder.name}</h3>
                <p className="text-xs text-gray-500">{folder.fileCount} files • Updated {folder.lastUpdated}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <Folder size={24} className='text-blue-600' />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{folder.name}</h3>
                <p className="text-xs text-gray-500">{folder.fileCount} files • Updated {folder.lastUpdated}</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderJobFolders = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
      {fileStructure.jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => { setCurrentView(job.id); setActiveTab('jobs'); }}
          className={`bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg hover:border-purple-300 transition ${
            viewMode === 'grid' 
              ? 'p-5 flex flex-col items-center text-center' 
              : 'p-4 flex items-center gap-3'
          }`}
        >
          {viewMode === 'grid' ? (
            <>
              <div className="mb-3 flex justify-center">
                <div className="p-2 bg-[#F0FDF4] rounded-lg">
                  <Briefcase size={32} className='text-[#16A34A]' />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Created by {job.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{job.role}</p>
                <p className="text-xs text-gray-400">Last edited: {job.lastEdited}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-[#F0FDF4] rounded-lg flex-shrink-0">
                <Briefcase size={24} className='text-[#16A34A]' />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">Created by {job.name}</h3>
                <p className="text-xs text-gray-500">{job.role}</p>
                <p className="text-xs text-gray-400">Last edited: {job.lastEdited}</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderFiles = (files, folderName) => (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setCurrentView('root')}
          className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{folderName}</h2>
          <p className="text-xs text-gray-500">{files.length} documents</p>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{file.size} • Modified {file.date}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition flex-shrink-0">
              <EllipsisVertical size={18} className="text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="w-full">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => { setActiveTab('root'); setCurrentView('root'); }}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition text-sm ${
              activeTab === 'root'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Folder size={18} />
            Job Folder
          </button>
          <button
            onClick={() => { setActiveTab('jobs'); setCurrentView('root'); }}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition text-sm ${
              activeTab === 'jobs'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-[#4B5563] hover:text-gray-900'
            }`}
          >
            <Briefcase size={18} />
            Individual Folder
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-full sm:max-w-xs">
            
            <div className="relative flex flex-row justify-center items-center gap-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className='flex flex-row bg-black rounded-lg border-2 border-[#E5E7EB] gap-0'>
              <button
              onClick={() => setViewMode('list')}
              className={`p-2  transition ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2  transition ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
           
            <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition text-sm ml-2">
              <Plus size={18} />
              {currentView === 'root' ? 'Upload File' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          {activeTab === 'root' && currentView === 'root' && renderRootFolders()}
          {activeTab === 'root' && currentView !== 'root' && renderFiles(
            fileStructure.root.folders.find(f => f.id === currentView)?.files || [],
            fileStructure.root.folders.find(f => f.id === currentView)?.name || ''
          )}
          {activeTab === 'jobs' && currentView === 'root' && renderJobFolders()}
          {activeTab === 'jobs' && currentView !== 'root' && renderFiles(
            fileStructure.jobs.find(j => j.id === currentView)?.files || [],
            fileStructure.jobs.find(j => j.id === currentView)?.name || ''
          )}
        </div>
      </div>
    </div>
  );
}