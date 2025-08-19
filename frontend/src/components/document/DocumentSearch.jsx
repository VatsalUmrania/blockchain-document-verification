// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import { 
//   MagnifyingGlassIcon, 
//   FunnelIcon, 
//   CalendarIcon,
//   TagIcon,
//   ArrowsUpDownIcon,
//   XMarkIcon,
//   AdjustmentsHorizontalIcon,
//   DocumentIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   ExclamationTriangleIcon,
//   ChartBarIcon
// } from '@heroicons/react/24/outline';
// import Button from '../common/Button';

// const DocumentSearch = ({ documents, onFilteredResults }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     category: 'all',
//     dateRange: 'all',
//     status: 'all',
//     size: 'all'
//   });
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [sortBy, setSortBy] = useState('date-desc');

//   useEffect(() => {
//     handleSearch();
//   }, [searchTerm, filters, sortBy, documents]);

//   const handleSearch = () => {
//     let filtered = [...documents];

//     // Text search
//     if (searchTerm) {
//       filtered = filtered.filter(doc => 
//         doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         doc.hash?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Category filter
//     if (filters.category !== 'all') {
//       filtered = filtered.filter(doc => doc.category === filters.category);
//     }

//     // Status filter
//     if (filters.status !== 'all') {
//       filtered = filtered.filter(doc => doc.status === filters.status);
//     }

//     // Date range filter
//     if (filters.dateRange !== 'all') {
//       const now = Date.now();
//       const ranges = {
//         'today': 24 * 60 * 60 * 1000,
//         'week': 7 * 24 * 60 * 60 * 1000,
//         'month': 30 * 24 * 60 * 60 * 1000,
//         'year': 365 * 24 * 60 * 60 * 1000
//       };
      
//       if (ranges[filters.dateRange]) {
//         filtered = filtered.filter(doc => 
//           now - doc.timestamp < ranges[filters.dateRange]
//         );
//       }
//     }

//     // Size filter
//     if (filters.size !== 'all') {
//       const sizeRanges = {
//         'small': [0, 1024 * 1024], // < 1MB
//         'medium': [1024 * 1024, 10 * 1024 * 1024], // 1-10MB
//         'large': [10 * 1024 * 1024, Infinity] // > 10MB
//       };
      
//       if (sizeRanges[filters.size]) {
//         const [min, max] = sizeRanges[filters.size];
//         filtered = filtered.filter(doc => 
//           doc.size >= min && doc.size < max
//         );
//       }
//     }

//     // Sorting
//     switch (sortBy) {
//       case 'date-desc':
//         filtered.sort((a, b) => b.timestamp - a.timestamp);
//         break;
//       case 'date-asc':
//         filtered.sort((a, b) => a.timestamp - b.timestamp);
//         break;
//       case 'name-asc':
//         filtered.sort((a, b) => a.name.localeCompare(b.name));
//         break;
//       case 'name-desc':
//         filtered.sort((a, b) => b.name.localeCompare(a.name));
//         break;
//       case 'size-desc':
//         filtered.sort((a, b) => b.size - a.size);
//         break;
//       case 'size-asc':
//         filtered.sort((a, b) => a.size - b.size);
//         break;
//     }

//     onFilteredResults(filtered);
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setFilters({
//       category: 'all',
//       dateRange: 'all',
//       status: 'all',
//       size: 'all'
//     });
//     setSortBy('date-desc');
//     toast.info('🧹 Filters cleared', {
//       icon: '🔄'
//     });
//   };

//   const getActiveFilterCount = () => {
//     let count = 0;
//     if (searchTerm) count++;
//     if (filters.category !== 'all') count++;
//     if (filters.dateRange !== 'all') count++;
//     if (filters.status !== 'all') count++;
//     if (filters.size !== 'all') count++;
//     if (sortBy !== 'date-desc') count++;
//     return count;
//   };

//   const activeFilters = getActiveFilterCount();

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="card mb-6"
//     >
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <MagnifyingGlassIcon className="w-5 h-5 text-[#296CFF]" />
//             <h3 className="text-lg font-semibold text-white">Search & Filter</h3>
//             {activeFilters > 0 && (
//               <span className="px-2 py-1 bg-[#296CFF]/20 text-[#296CFF] text-xs font-semibold rounded-full border border-[#296CFF]/30">
//                 {activeFilters} active
//               </span>
//             )}
//           </div>
//           <div className="text-sm text-[#999999]">
//             {documents.length} document{documents.length !== 1 ? 's' : ''}
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="relative">
//           <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search documents by name, description, or hash..."
//             className="input-field pl-12 pr-4 h-12 text-base"
//           />
//           {searchTerm && (
//             <motion.button
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               onClick={() => setSearchTerm('')}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//             >
//               <XMarkIcon className="w-4 h-4" />
//             </motion.button>
//           )}
//         </div>

//         {/* Filter Controls */}
//         <div className="flex flex-wrap items-center gap-4">
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//               variant="outline"
//               size="sm"
//               className={`flex items-center space-x-2 ${
//                 showAdvancedFilters ? 'bg-[#296CFF]/10 border-[#296CFF] text-[#296CFF]' : ''
//               }`}
//             >
//               <AdjustmentsHorizontalIcon className="w-4 h-4" />
//               <span>Advanced Filters</span>
//               {activeFilters > 0 && !showAdvancedFilters && (
//                 <span className="ml-1 px-1.5 py-0.5 bg-[#296CFF] text-white text-xs rounded-full">
//                   {activeFilters}
//                 </span>
//               )}
//             </Button>
//           </motion.div>

//           {/* Sort Dropdown */}
//           <div className="flex items-center space-x-2">
//             <ArrowsUpDownIcon className="w-4 h-4 text-[#666666]" />
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="input-field w-auto min-w-[150px] h-10"
//             >
//               <option value="date-desc">Latest First</option>
//               <option value="date-asc">Oldest First</option>
//               <option value="name-asc">Name A-Z</option>
//               <option value="name-desc">Name Z-A</option>
//               <option value="size-desc">Largest First</option>
//               <option value="size-asc">Smallest First</option>
//             </select>
//           </div>

//           {activeFilters > 0 && (
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//             >
//               <Button 
//                 onClick={clearFilters} 
//                 variant="ghost" 
//                 size="sm"
//                 className="flex items-center space-x-2"
//               >
//                 <XMarkIcon className="w-4 h-4" />
//                 <span>Clear All</span>
//               </Button>
//             </motion.div>
//           )}
//         </div>

//         {/* Advanced Filters */}
//         {showAdvancedFilters && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[#333333]"
//           >
//             {/* Category Filter */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-semibold text-white mb-3">
//                 <TagIcon className="w-4 h-4 text-[#00C853]" />
//                 <span>Category</span>
//               </label>
//               <select
//                 value={filters.category}
//                 onChange={(e) => setFilters({...filters, category: e.target.value})}
//                 className="input-field w-full"
//               >
//                 <option value="all">All Categories</option>
//                 <option value="document">Document</option>
//                 <option value="certificate">Certificate</option>
//                 <option value="contract">Contract</option>
//                 <option value="identity">Identity</option>
//                 <option value="financial">Financial</option>
//                 <option value="legal">Legal</option>
//                 <option value="medical">Medical</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             {/* Date Range Filter */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-semibold text-white mb-3">
//                 <CalendarIcon className="w-4 h-4 text-[#296CFF]" />
//                 <span>Date Range</span>
//               </label>
//               <select
//                 value={filters.dateRange}
//                 onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
//                 className="input-field w-full"
//               >
//                 <option value="all">All Time</option>
//                 <option value="today">Today</option>
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="year">This Year</option>
//               </select>
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-semibold text-white mb-3">
//                 <CheckCircleIcon className="w-4 h-4 text-[#8B5CF6]" />
//                 <span>Status</span>
//               </label>
//               <select
//                 value={filters.status}
//                 onChange={(e) => setFilters({...filters, status: e.target.value})}
//                 className="input-field w-full"
//               >
//                 <option value="all">All Status</option>
//                 <option value="verified">✅ Verified</option>
//                 <option value="pending">⏳ Pending</option>
//                 <option value="failed">❌ Failed</option>
//               </select>
//             </div>

//             {/* File Size Filter */}
//             <div>
//               <label className="flex items-center space-x-2 text-sm font-semibold text-white mb-3">
//                 <ChartBarIcon className="w-4 h-4 text-[#FF9800]" />
//                 <span>File Size</span>
//               </label>
//               <select
//                 value={filters.size}
//                 onChange={(e) => setFilters({...filters, size: e.target.value})}
//                 className="input-field w-full"
//               >
//                 <option value="all">All Sizes</option>
//                 <option value="small">📱 Small (&lt; 1MB)</option>
//                 <option value="medium">💼 Medium (1-10MB)</option>
//                 <option value="large">📦 Large (&gt; 10MB)</option>
//               </select>
//             </div>
//           </motion.div>
//         )}

//         {/* Active Filters Display */}
//         {activeFilters > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#333333]"
//           >
//             <span className="text-sm font-medium text-[#E0E0E0] flex items-center space-x-1">
//               <FunnelIcon className="w-4 h-4" />
//               <span>Active filters:</span>
//             </span>
            
//             {searchTerm && (
//               <span className="px-3 py-1 bg-[#296CFF]/20 text-[#296CFF] text-xs font-medium rounded-full border border-[#296CFF]/30 flex items-center space-x-1">
//                 <MagnifyingGlassIcon className="w-3 h-3" />
//                 <span>"{searchTerm}"</span>
//               </span>
//             )}
            
//             {filters.category !== 'all' && (
//               <span className="px-3 py-1 bg-[#00C853]/20 text-[#00C853] text-xs font-medium rounded-full border border-[#00C853]/30 flex items-center space-x-1">
//                 <TagIcon className="w-3 h-3" />
//                 <span>{filters.category}</span>
//               </span>
//             )}
            
//             {filters.dateRange !== 'all' && (
//               <span className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-medium rounded-full border border-[#8B5CF6]/30 flex items-center space-x-1">
//                 <CalendarIcon className="w-3 h-3" />
//                 <span>{filters.dateRange}</span>
//               </span>
//             )}
            
//             {filters.status !== 'all' && (
//               <span className="px-3 py-1 bg-[#FF9800]/20 text-[#FF9800] text-xs font-medium rounded-full border border-[#FF9800]/30 flex items-center space-x-1">
//                 {filters.status === 'verified' && <CheckCircleIcon className="w-3 h-3" />}
//                 {filters.status === 'pending' && <ClockIcon className="w-3 h-3" />}
//                 {filters.status === 'failed' && <ExclamationTriangleIcon className="w-3 h-3" />}
//                 <span>{filters.status}</span>
//               </span>
//             )}
            
//             {filters.size !== 'all' && (
//               <span className="px-3 py-1 bg-[#FF4C4C]/20 text-[#FF4C4C] text-xs font-medium rounded-full border border-[#FF4C4C]/30 flex items-center space-x-1">
//                 <ChartBarIcon className="w-3 h-3" />
//                 <span>{filters.size}</span>
//               </span>
//             )}
            
//             {sortBy !== 'date-desc' && (
//               <span className="px-3 py-1 bg-[#333333] text-[#E0E0E0] text-xs font-medium rounded-full border border-[#444444] flex items-center space-x-1">
//                 <ArrowsUpDownIcon className="w-3 h-3" />
//                 <span>sorted</span>
//               </span>
//             )}
//           </motion.div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default DocumentSearch;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon,
  TagIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  DocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';

const DocumentSearch = ({ documents, onFilteredResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: 'all',
    status: 'all',
    size: 'all'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filters, sortBy, documents]);

  const handleSearch = () => {
    let filtered = [...documents];

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        'today': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000
      };
      
      if (ranges[filters.dateRange]) {
        filtered = filtered.filter(doc => 
          now - doc.timestamp < ranges[filters.dateRange]
        );
      }
    }

    // Size filter
    if (filters.size !== 'all') {
      const sizeRanges = {
        'small': [0, 1024 * 1024], // < 1MB
        'medium': [1024 * 1024, 10 * 1024 * 1024], // 1-10MB
        'large': [10 * 1024 * 1024, Infinity] // > 10MB
      };
      
      if (sizeRanges[filters.size]) {
        const [min, max] = sizeRanges[filters.size];
        filtered = filtered.filter(doc => 
          doc.size >= min && doc.size < max
        );
      }
    }

    // Sorting
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'size-desc':
        filtered.sort((a, b) => b.size - a.size);
        break;
      case 'size-asc':
        filtered.sort((a, b) => a.size - b.size);
        break;
    }

    onFilteredResults(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: 'all',
      dateRange: 'all',
      status: 'all',
      size: 'all'
    });
    setSortBy('date-desc');
    toast.info('🧹 Filters cleared', {
      icon: '🔄'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.size !== 'all') count++;
    if (sortBy !== 'date-desc') count++;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <MagnifyingGlassIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Search & Filter</h3>
            <AnimatePresence>
              {activeFilters > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="px-2 py-1 bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))] text-xs font-semibold rounded-full border border-[rgb(var(--color-primary)/0.3)]"
                >
                  {activeFilters} active
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-sm text-[rgb(var(--text-secondary))]">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-quaternary))]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by name, description, or hash..."
            className="input-field pl-12 pr-4 h-12 text-base"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant={showAdvancedFilters ? "primary" : "secondary"}
              size="sm"
              icon={AdjustmentsHorizontalIcon}
              className="relative"
            >
              Advanced Filters
              <AnimatePresence>
                {activeFilters > 0 && !showAdvancedFilters && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="ml-1 px-1.5 py-0.5 bg-[rgb(var(--color-primary))] text-white text-xs rounded-full"
                  >
                    {activeFilters}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <ArrowsUpDownIcon className="w-4 h-4 text-[rgb(var(--text-quaternary))]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto min-w-[150px] h-10"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>
          </div>

          <AnimatePresence>
            {activeFilters > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button 
                  onClick={clearFilters} 
                  variant="ghost" 
                  size="sm"
                  icon={XMarkIcon}
                >
                  Clear All
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[rgb(var(--border-primary))] overflow-hidden"
            >
              {/* Category Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
                  <TagIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                  <span>Category</span>
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="all">All Categories</option>
                  <option value="document">Document</option>
                  <option value="certificate">Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="identity">Identity</option>
                  <option value="financial">Financial</option>
                  <option value="legal">Legal</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
                  <CalendarIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  <span>Date Range</span>
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
                  <CheckCircleIcon className="w-4 h-4 text-[rgb(139,92,246)]" />
                  <span>Status</span>
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="all">All Status</option>
                  <option value="verified">✅ Verified</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="failed">❌ Failed</option>
                </select>
              </div>

              {/* File Size Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
                  <ChartBarIcon className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                  <span>File Size</span>
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters({...filters, size: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="all">All Sizes</option>
                  <option value="small">📱 Small (&lt; 1MB)</option>
                  <option value="medium">💼 Medium (1-10MB)</option>
                  <option value="large">📦 Large (&gt; 10MB)</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        <AnimatePresence>
          {activeFilters > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap items-center gap-2 pt-4 border-t border-[rgb(var(--border-primary))]"
            >
              <span className="text-sm font-medium text-[rgb(var(--text-primary))] flex items-center space-x-1">
                <FunnelIcon className="w-4 h-4" />
                <span>Active filters:</span>
              </span>
              
              {searchTerm && (
                <span className="px-3 py-1 bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))] text-xs font-medium rounded-full border border-[rgb(var(--color-primary)/0.3)] flex items-center space-x-1">
                  <MagnifyingGlassIcon className="w-3 h-3" />
                  <span>"{searchTerm}"</span>
                </span>
              )}
              
              {filters.category !== 'all' && (
                <span className="px-3 py-1 bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] text-xs font-medium rounded-full border border-[rgb(var(--color-success)/0.3)] flex items-center space-x-1">
                  <TagIcon className="w-3 h-3" />
                  <span>{filters.category}</span>
                </span>
              )}
              
              {filters.dateRange !== 'all' && (
                <span className="px-3 py-1 bg-[rgba(139,92,246,0.2)] text-[rgb(139,92,246)] text-xs font-medium rounded-full border border-[rgba(139,92,246,0.3)] flex items-center space-x-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{filters.dateRange}</span>
                </span>
              )}
              
              {filters.status !== 'all' && (
                <span className="px-3 py-1 bg-[rgb(var(--color-warning)/0.2)] text-[rgb(var(--color-warning))] text-xs font-medium rounded-full border border-[rgb(var(--color-warning)/0.3)] flex items-center space-x-1">
                  {filters.status === 'verified' && <CheckCircleIcon className="w-3 h-3" />}
                  {filters.status === 'pending' && <ClockIcon className="w-3 h-3" />}
                  {filters.status === 'failed' && <ExclamationTriangleIcon className="w-3 h-3" />}
                  <span>{filters.status}</span>
                </span>
              )}
              
              {filters.size !== 'all' && (
                <span className="px-3 py-1 bg-[rgb(var(--color-error)/0.2)] text-[rgb(var(--color-error))] text-xs font-medium rounded-full border border-[rgb(var(--color-error)/0.3)] flex items-center space-x-1">
                  <ChartBarIcon className="w-3 h-3" />
                  <span>{filters.size}</span>
                </span>
              )}
              
              {sortBy !== 'date-desc' && (
                <span className="px-3 py-1 bg-[rgb(var(--text-quaternary)/0.2)] text-[rgb(var(--text-primary))] text-xs font-medium rounded-full border border-[rgb(var(--border-primary))] flex items-center space-x-1">
                  <ArrowsUpDownIcon className="w-3 h-3" />
                  <span>sorted</span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DocumentSearch;
