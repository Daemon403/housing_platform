import { useRef, useState, useCallback, ChangeEvent } from 'react';
import styles from '../styles/ImageUpload.module.css';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  initialImages?: string[];
}

export function ImageUpload({ 
  onImagesChange, 
  maxFiles = 10, 
  maxSizeMB = 5,
  className = '',
  initialImages = []
}: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(`File '${file.name}' is not an image.`);
        continue;
      }
      
      // Check file size
      if (file.size > maxSize) {
        setError(`File '${file.name}' exceeds the maximum size of ${maxSizeMB}MB.`);
        continue;
      }
      
      // Check total number of files
      if (validFiles.length + previewUrls.length >= maxFiles) {
        setError(`Maximum of ${maxFiles} images allowed.`);
        break;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  }, [maxFiles, maxSizeMB, previewUrls.length]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const validFiles = validateFiles(e.target.files);
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, maxFiles));
    
    // Convert FileList to array and pass to parent
    const fileArray = Array.from(validFiles);
    onImagesChange(fileArray);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxFiles, onImagesChange, validateFiles]);

  const removeImage = useCallback((index: number) => {
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
    
    // Notify parent about the removed image
    onImagesChange(previewUrls.filter((_, i) => i !== index).map((_, i) => new File([], `image-${i}.jpg`)));
  }, [onImagesChange, previewUrls]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }
    
    const validFiles = validateFiles(e.dataTransfer.files);
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, maxFiles));
    
    // Convert FileList to array and pass to parent
    const fileArray = Array.from(validFiles);
    onImagesChange(fileArray);
  }, [maxFiles, onImagesChange, validateFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      <div 
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <div className={styles.uploadPrompt}>
          <i className="fas fa-cloud-upload-alt"></i>
          <p>Drag & drop images here, or click to select</p>
          <p className={styles.hint}>
            Max {maxFiles} images ({maxSizeMB}MB each)
          </p>
        </div>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {previewUrls.length > 0 && (
        <div className={styles.previewContainer}>
          <div className={styles.previewGrid}>
            {previewUrls.map((url, index) => (
              <div key={index} className={styles.previewItem}>
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className={styles.previewImage}
                />
                <button 
                  type="button" 
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  aria-label="Remove image"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
