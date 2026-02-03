import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-9 w-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 bg-gray-300 dark:bg-gray-600"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            <span className="sr-only">Toggle theme</span>

            {/* Sliding circle with icon */}
            <span
                className={`${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                    } inline-flex items-center justify-center h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300`}
            >
                {theme === 'light' ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                    <Moon className="h-4 w-4 text-blue-500" />
                )}
            </span>
        </button>
    );
}
