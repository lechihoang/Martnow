import React from 'react';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 text-gray-600 hover:text-blue-600 transition-colors tooltip-trigger"
      aria-label="Tìm kiếm"
      title="Tìm kiếm"
    >
      <Search className="w-5 h-5" />
    </button>
  );
};

export default SearchButton;
