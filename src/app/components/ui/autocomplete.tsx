import { useState, useEffect, useRef } from "react";
import { Input } from "./input";

interface AutocompleteProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function Autocomplete({
    options,
    value,
    onChange,
    placeholder,
    className,
    id
}: AutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options based on start of string, case insensitive
    const filteredOptions = options.filter(option =>
        option.toLowerCase().startsWith(value.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <Input
                id={id}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
            />
            {showSuggestions && value && filteredOptions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    {filteredOptions.map((option) => (
                        <li
                            key={option}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            onClick={() => {
                                onChange(option);
                                setShowSuggestions(false);
                            }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
