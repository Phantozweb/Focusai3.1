import React, { useState, useMemo } from 'react';
import { HistoryLog, HistoryItemType } from '../types';
import { Search, MessageSquare, BookUser, Trash2 } from 'lucide-react';

interface HistoryPageProps {
  history: HistoryLog[];
  onItemSelect: (item: HistoryLog) => void;
  onItemDelete: (itemId: string, itemTitle: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onItemSelect, onItemDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesSearch = searchTerm === '' || item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [history, searchTerm, filterType]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: HistoryItemType.Chat, label: 'AI Chats' },
    { id: HistoryItemType.CaseStudy, label: 'Case Studies' },
  ];

  return (
    <div className="h-full w-full bg-gray-900 text-gray-300">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 h-full flex flex-col">
        <header className="flex-shrink-0">
          <h1 className="text-4xl font-extrabold text-white">History</h1>
          <p className="text-lg text-gray-400 mt-2">Browse, search, and manage all your past activities.</p>
        </header>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 my-6 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-base focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1 space-x-1 border border-gray-700">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filterType === filter.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map(item => (
                <div key={item.id} className="bg-gray-800/50 hover:bg-gray-800 rounded-lg flex items-center transition-colors group">
                  <div className="flex items-center gap-4 cursor-pointer flex-1 p-4" onClick={() => onItemSelect(item)}>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      {item.type === HistoryItemType.Chat ? <MessageSquare size={20} className="text-blue-400"/> : <BookUser size={20} className="text-green-400"/>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-white truncate text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pr-4">
                    <button onClick={() => onItemDelete(item.id, item.title)} className="p-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 flex flex-col items-center justify-center h-full">
              <h3 className="text-2xl font-semibold">No History Found</h3>
              <p className="mt-2 max-w-sm">Your search or filter returned no results, or you haven't started any activities yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
