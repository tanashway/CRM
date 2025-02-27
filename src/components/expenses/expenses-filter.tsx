'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { format } from 'date-fns';

// Common expense categories
const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Travel',
  'Meals',
  'Rent',
  'Utilities',
  'Software',
  'Hardware',
  'Marketing',
  'Consulting',
  'Salaries',
  'Insurance',
  'Taxes',
  'Other'
];

export function ExpensesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get('startDate') ? new Date(searchParams.get('startDate') as string) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get('endDate') ? new Date(searchParams.get('endDate') as string) : undefined
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Check if any filters are applied
  const hasFilters = category || startDate || endDate || search;
  
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when applying filters
    params.set('page', '1');
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    if (startDate) {
      params.set('startDate', format(startDate, 'yyyy-MM-dd'));
    } else {
      params.delete('startDate');
    }
    
    if (endDate) {
      params.set('endDate', format(endDate, 'yyyy-MM-dd'));
    } else {
      params.delete('endDate');
    }
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    router.push(`/expenses?${params.toString()}`);
    setIsFiltersOpen(false);
  };
  
  const resetFilters = () => {
    setCategory('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearch('');
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('startDate');
    params.delete('endDate');
    params.delete('search');
    params.set('page', '1');
    
    router.push(`/expenses?${params.toString()}`);
    setIsFiltersOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters();
              }
            }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch('');
                const params = new URLSearchParams(searchParams.toString());
                params.delete('search');
                router.push(`/expenses?${params.toString()}`);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isFiltersOpen ? "secondary" : "outline"}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="whitespace-nowrap"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {hasFilters && (
              <span className="ml-1 rounded-full bg-primary w-2 h-2" />
            )}
          </Button>
          
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          
          <Button onClick={applyFilters}>
            Apply
          </Button>
        </div>
      </div>
      
      {isFiltersOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-card">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => 
                    startDate ? date < startDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
} 