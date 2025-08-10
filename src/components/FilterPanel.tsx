import React from 'react';

interface FilterPanelProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilters: string[];
  onCategoryChange: (categories: string[]) => void;
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilters,
  onCategoryChange,
  timeFilter,
  onTimeFilterChange,
}) => {
  const categories = ['To Do', 'In Progress', 'Review', 'Completed'];
  const timeOptions = [
    { value: '', label: 'All tasks' },
    { value: '1week', label: 'Tasks within 1 week' },
    { value: '2weeks', label: 'Tasks within 2 weeks' },
    { value: '3weeks', label: 'Tasks within 3 weeks' },
  ];

  const handleCategoryToggle = (category: string) => {
    const updated = categoryFilters.includes(category)
      ? categoryFilters.filter(c => c !== category)
      : [...categoryFilters, category];
    onCategoryChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Name
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={categoryFilters.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="mr-2"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Range
        </label>
        <div className="space-y-2">
          {timeOptions.map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="timeFilter"
                value={option.value}
                checked={timeFilter === option.value}
                onChange={(e) => onTimeFilterChange(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;