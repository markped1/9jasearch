'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
    images: string[];
    businessName: string;
}

export default function ImageGallery({ images, businessName }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <div className={styles.gallerySection}>
                <h3 className={styles.sectionTitle}>📸 Gallery</h3>
                <div className={styles.grid}>
                    {images.slice(0, 6).map((url, index) => (
                        <div
                            key={index}
                            className={styles.imageCard}
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={url}
                                alt={`${businessName} - Photo ${index + 1}`}
                                fill
                                className={styles.image}
                            />
                            <div className={styles.overlay}>
                                <ZoomIn size={24} />
                            </div>
                            {index === 5 && images.length > 6 && (
                                <div className={styles.moreOverlay}>
                                    +{images.length - 6} more
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className={styles.lightbox} onClick={closeLightbox}>
                    <button className={styles.closeBtn} onClick={closeLightbox}>
                        <X size={28} />
                    </button>

                    <button
                        className={`${styles.navBtn} ${styles.prevBtn}`}
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    >
                        <ChevronLeft size={36} />
                    </button>

                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={images[currentIndex]}
                            alt={`${businessName} - Photo ${currentIndex + 1}`}
                            fill
                            className={styles.lightboxImage}
                        />
                    </div>

                    <button
                        className={`${styles.navBtn} ${styles.nextBtn}`}
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                    >
                        <ChevronRight size={36} />
                    </button>

                    <div className={styles.counter}>
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}
