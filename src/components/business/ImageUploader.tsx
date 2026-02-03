'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    uploadPreset?: string;
}

export default function ImageUploader({
    images,
    onImagesChange,
    maxImages = 10,
    uploadPreset = 'eagle_search_uploads'
}: ImageUploaderProps) {

    const handleUploadSuccess = (result: any) => {
        if (result.event === 'success') {
            const newImages = [...images, result.info.secure_url];
            onImagesChange(newImages);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const canUploadMore = images.length < maxImages;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3><ImageIcon size={20} /> Business Images</h3>
                <span className={styles.count}>{images.length} / {maxImages}</span>
            </div>

            <div className={styles.grid}>
                {images.map((url, index) => (
                    <div key={index} className={styles.imageCard}>
                        <Image
                            src={url}
                            alt={`Business image ${index + 1}`}
                            width={200}
                            height={200}
                            className={styles.image}
                        />
                        <button
                            onClick={() => handleRemoveImage(index)}
                            className={styles.removeBtn}
                            type="button"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {canUploadMore && (
                    <CldUploadWidget
                        uploadPreset={uploadPreset}
                        onSuccess={handleUploadSuccess}
                        options={{
                            maxFiles: 1,
                            resourceType: 'image',
                            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                            maxFileSize: 5000000, // 5MB
                        }}
                    >
                        {({ open }) => (
                            <button
                                onClick={() => open()}
                                className={styles.uploadBtn}
                                type="button"
                            >
                                <Upload size={32} />
                                <span>Upload Image</span>
                            </button>
                        )}
                    </CldUploadWidget>
                )}
            </div>

            {!canUploadMore && (
                <p className={styles.maxReached}>Maximum images reached. Remove some to upload more.</p>
            )}
        </div>
    );
}
