import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useToast } from '../contexts/ToastContext';

interface ImageUploadProps {
    initialImage?: string;
    onImageUpload: (imageData: string) => void;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const isHttpUrl = (str: string) => str.startsWith('http://') || str.startsWith('https://');
const isDataUrl = (str: string) => str.startsWith('data:image');


export const ImageUpload = ({ initialImage, onImageUpload }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    useEffect(() => {
        if (initialImage) {
            if (isHttpUrl(initialImage)) {
                setImageUrlInput(initialImage);
                setPreview(initialImage);
            } else if (isDataUrl(initialImage)) {
                setImageUrlInput('');
                setPreview(initialImage);
            }
        } else {
            setPreview(null);
            setImageUrlInput('');
        }
    }, [initialImage]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            const url = imageUrlInput.trim();
            if (url && isHttpUrl(url)) {
                try {
                    new URL(url); // Validate syntax
                    setPreview(url);
                    onImageUpload(url);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                } catch (e) {
                    // Invalid URL syntax, but don't toast as user might still be typing.
                }
            } else if (url === '' && !isDataUrl(preview || '')) {
                // User cleared the URL input, so clear the preview and parent state
                setPreview(null);
                onImageUpload('');
            }
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [imageUrlInput, onImageUpload, preview]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                addToast(`Invalid file type. Please upload a JPG, PNG, or WebP image.`, 'error');
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                addToast(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`, 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                onImageUpload(base64String);
                setImageUrlInput(''); // Clear URL input if file is uploaded
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageError = () => {
        if (preview && preview !== PLACEHOLDER_IMAGE_URL) {
            setPreview(PLACEHOLDER_IMAGE_URL);
            addToast('The provided image URL could not be loaded.', 'error');
            onImageUpload(''); // Inform parent that the URL is invalid
        }
    };

    return (
        <div>
             <label className="block text-sm font-bold text-orange-800 mb-1">Image</label>
            <div
                className="w-full h-48 bg-amber-100 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-amber-200/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={ALLOWED_MIME_TYPES.join(',')}
                />
                {preview ? (
                    <img src={preview} alt="Preview" onError={handleImageError} className="w-full h-full object-contain rounded-md p-1" />
                ) : (
                    <div className="text-center text-orange-700 pointer-events-none">
                        <Icon name="image" className="w-12 h-12 mx-auto" />
                        <p className="mt-2 text-sm">Click to upload or drag image</p>
                        <p className="text-xs text-orange-600/80">Max {MAX_FILE_SIZE_MB}MB, JPG/PNG/WEBP</p>
                    </div>
                )}
            </div>
             <div className="text-center my-2 text-stone-500 font-semibold">OR</div>
            <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste an image URL"
                className="w-full p-3 rounded-lg border-2 border-orange-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-sm"
            />
        </div>
    );
};