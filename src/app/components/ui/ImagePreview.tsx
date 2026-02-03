import { ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'wide' | 'square';
    className?: string;
}

export function ImagePreview({ src, alt = 'Preview', size = 'medium', className = '' }: ImagePreviewProps) {
    const sizeClass = `image-preview-${size}`;

    return (
        <div className={`${sizeClass} ${className}`}>
            {src ? (
                <img src={src} alt={alt} />
            ) : (
                <div className="image-preview-placeholder">
                    <div>
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No image uploaded</p>
                    </div>
                </div>
            )}
        </div>
    );
}
