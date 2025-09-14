import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Calendar,
  Tag,
  ArrowUpDown,
  X,
  Settings2,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Types and Interfaces
interface Document {
  id: string;
  name: string;
  description?: string;
  hash?: string;
  category: string;
  status: 'verified' | 'pending' | 'failed';
  timestamp: number;
  size: number;
}

interface FilterState {
  category: string;
  dateRange: string;
  status: string;
  size: string;
}

interface DocumentSearchProps {
  documents: Document[];
  onFilteredResults: (filteredDocuments: Document[]) => void;
  className?: string;
}

interface DateRange {
  [key: string]: number;
}

interface SizeRange {
  [key: string]: [number, number];
}

interface FilterConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  label: string;
}

const DocumentSearch: React.FC<DocumentSearchProps> = ({ 
  documents, 
  onFilteredResults,
  className 
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    dateRange: 'all',
    status: 'all',
    size: 'all'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Search and filter logic
  const handleSearch = useCallback(() => {
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
      const ranges: DateRange = {
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
      const sizeRanges: SizeRange = {
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
  }, [searchTerm, filters, sortBy, documents, onFilteredResults]);

  // Effect to trigger search when dependencies change
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Clear all filters
  const clearFilters = useCallback((): void => {
    setSearchTerm('');
    setFilters({
      category: 'all',
      dateRange: 'all',
      status: 'all',
      size: 'all'
    });
    setSortBy('date-desc');
    toast.success('Filters Cleared', {
      description: 'All search filters have been reset',
    });
  }, []);

  // Get active filter count
  const getActiveFilterCount = useCallback((): number => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.size !== 'all') count++;
    if (sortBy !== 'date-desc') count++;
    return count;
  }, [searchTerm, filters, sortBy]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey: keyof FilterState, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  // Handle search term clear
  const handleClearSearch = useCallback((): void => {
    setSearchTerm('');
  }, []);

  // Toggle advanced filters
  const handleToggleAdvancedFilters = useCallback((): void => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  const activeFilters = getActiveFilterCount();

  // Filter configurations for active filter display
  const filterConfigs: Record<string, FilterConfig> = {
    search: { icon: Search, color: 'bg-primary/10 text-primary border-primary/20', label: 'Search' },
    category: { icon: Tag, color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', label: 'Category' },
    dateRange: { icon: Calendar, color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', label: 'Date' },
    status: { icon: CheckCircle, color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800', label: 'Status' },
    size: { icon: BarChart3, color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', label: 'Size' },
    sort: { icon: ArrowUpDown, color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700', label: 'Sort' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-6", className)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <span>Search & Filter</span>
              <AnimatePresence>
                {activeFilters > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {activeFilters} active
                    </Badge>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="text-sm text-muted-foreground">
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents by name, description, or hash..."
              className="pl-12 pr-12 h-12 text-base"
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleToggleAdvancedFilters}
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Advanced Filters
                <AnimatePresence>
                  {activeFilters > 0 && !showAdvancedFilters && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFilters}
                      </Badge>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="size-desc">Largest First</SelectItem>
                  <SelectItem value="size-asc">Smallest First</SelectItem>
                </SelectContent>
              </Select>
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
                  >
                    <X className="w-4 h-4 mr-2" />
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
                className="overflow-hidden"
              >
                <Separator className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-semibold">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>Category</span>
                    </Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="identity">Identity</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-semibold">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Date Range</span>
                    </Label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => handleFilterChange('dateRange', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Status</span>
                    </Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="verified">✅ Verified</SelectItem>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="failed">❌ Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Size Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-semibold">
                      <BarChart3 className="w-4 h-4 text-yellow-600" />
                      <span>File Size</span>
                    </Label>
                    <Select
                      value={filters.size}
                      onValueChange={(value) => handleFilterChange('size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="small">📱 Small (&lt; 1MB)</SelectItem>
                        <SelectItem value="medium">💼 Medium (1-10MB)</SelectItem>
                        <SelectItem value="large">📦 Large (&gt; 10MB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
              >
                <Separator className="mb-4" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium flex items-center space-x-1">
                    <Filter className="w-4 h-4" />
                    <span>Active filters:</span>
                  </span>
                  
                  {searchTerm && (
                    <Badge className={filterConfigs.search.color}>
                      <Search className="w-3 h-3 mr-1" />
                      "{searchTerm}"
                    </Badge>
                  )}
                  
                  {filters.category !== 'all' && (
                    <Badge className={filterConfigs.category.color}>
                      <Tag className="w-3 h-3 mr-1" />
                      {filters.category}
                    </Badge>
                  )}
                  
                  {filters.dateRange !== 'all' && (
                    <Badge className={filterConfigs.dateRange.color}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {filters.dateRange}
                    </Badge>
                  )}
                  
                  {filters.status !== 'all' && (
                    <Badge className={filterConfigs.status.color}>
                      {filters.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {filters.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {filters.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {filters.status}
                    </Badge>
                  )}
                  
                  {filters.size !== 'all' && (
                    <Badge className={filterConfigs.size.color}>
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {filters.size}
                    </Badge>
                  )}
                  
                  {sortBy !== 'date-desc' && (
                    <Badge className={filterConfigs.sort.color}>
                      <ArrowUpDown className="w-3 h-3 mr-1" />
                      sorted
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DocumentSearch;
