/**
 * ImageViewerModal Component
 * 
 * Full-screen modal for viewing vault item images
 */

import { useState, useEffect } from 'react';
import { MdClose, MdZoomIn, MdZoomOut, MdDownload, MdOpenInNew, MdRotateRight } from 'react-icons/md';

interface ImageViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    fileName?: string;
    title?: string;
}

export const ImageViewerModal = ({
    isOpen,
    onClose,
    imageUrl,
    fileName,
    title,
}: ImageViewerModalProps) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setRotation(0);
            setIsLoading(true);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'vault-document.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <h3 className="text-title-md font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                        {title || fileName || 'Document'}
                    </h3>
                    {fileName && title && (
                        <span className="text-label-sm text-white/60 hidden sm:inline truncate max-w-[200px]">
                            {fileName}
                        </span>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors touch-target"
                    aria-label="Close"
                >
                    <MdClose size={24} />
                </button>
            </div>

            {/* Image Container */}
            <div
                className="relative flex items-center justify-center w-full h-full p-16"
                onClick={(e) => e.stopPropagation()}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={imageUrl}
                    alt={fileName || 'Document'}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        opacity: isLoading ? 0 : 1,
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                    draggable={false}
                />
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleZoomOut();
                        }}
                        disabled={scale <= 0.5}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                        aria-label="Zoom out"
                    >
                        <MdZoomOut size={24} />
                    </button>
                    <span className="text-label-md text-white min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleZoomIn();
                        }}
                        disabled={scale >= 3}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                        aria-label="Zoom in"
                    >
                        <MdZoomIn size={24} />
                    </button>
                    <div className="w-px h-6 bg-white/30 mx-2" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRotate();
                        }}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors touch-target"
                        aria-label="Rotate"
                    >
                        <MdRotateRight size={24} />
                    </button>
                    <div className="w-px h-6 bg-white/30 mx-2" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors touch-target"
                        aria-label="Download"
                    >
                        <MdDownload size={24} />
                    </button>
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors touch-target"
                        aria-label="Open in new tab"
                    >
                        <MdOpenInNew size={24} />
                    </a>
                </div>
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-20 left-0 right-0 text-center">
                <span className="text-label-sm text-white/40">
                    Press ESC to close • Click outside to close
                </span>
            </div>
        </div>
    );
};

