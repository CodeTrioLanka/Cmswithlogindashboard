import { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadToCloudinary } from '../../../services/cloudinaryApi';
import { toast } from 'sonner';

interface ImageUploadInputProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string; // Allow custom styling if needed
    accept?: string;
}

export function ImageUploadInput({ value, onChange, placeholder = "Image URL", disabled = false, className = "", accept = "image/*" }: ImageUploadInputProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file: File) => {
        try {
            setUploading(true);
            const url = await uploadToCloudinary(file);
            onChange(url);
            toast.success('File uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                handleUpload(file);
            }
        };
        input.click();
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled || uploading}
                className={`px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {uploading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Browse'}
            </button>
        </div>
    );
}
