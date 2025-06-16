import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

// Select Context
const SelectContext = React.createContext({});

// Main Select Component
export const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// Select Trigger
export const SelectTrigger = ({ className = '', children, ...props }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

// Select Value
export const SelectValue = ({ placeholder = 'Select...' }) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className="block truncate">
      {value ? (typeof value === 'string' ? value : value.label) : <span className="text-gray-500">{placeholder}</span>}
    </span>
  );
};

// Select Content
export const SelectContent = ({ className = '', children, ...props }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Select Item
export const SelectItem = ({ value, children, disabled = false }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
  const isSelected = typeof selectedValue === 'string' ? selectedValue === value : selectedValue?.value === value;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value);
      setIsOpen(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${
        disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 hover:bg-indigo-50'
      } ${isSelected ? 'bg-indigo-50' : ''}`}
    >
      {isSelected && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};

// Command Component for searchable selects
export const Command = ({ children }) => {
  return <div className="flex flex-col">{children}</div>;
};

// Command Input
export const CommandInput = ({ placeholder = 'Search...', value, onChange }) => {
  return (
    <div className="flex items-center border-b px-3 pb-2">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
      />
    </div>
  );
};

// Command Empty
export const CommandEmpty = ({ children }) => {
  return <div className="py-6 text-center text-sm text-gray-500">{children}</div>;
};

// Command Group
export const CommandGroup = ({ heading, children }) => {
  return (
    <div>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{heading}</div>
      )}
      {children}
    </div>
  );
};

// Command Item
export const CommandItem = ({ value, onSelect, children, disabled = false }) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value);
      setIsOpen(false);
      if (onSelect) onSelect(value);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 hover:text-indigo-900'
      }`}
    >
      {children}
    </div>
  );
}; 