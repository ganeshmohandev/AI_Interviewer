// components/PdfUploader.tsx
"use client"
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

const PdfUploader = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('Cloudinary object:', window.cloudinary);
    if (window.cloudinary) {
      const myWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'your_cloud_name',
          uploadPreset: 'your_upload_preset',
          resourceType: 'raw', // Use 'raw' for PDFs
          tags: ['pdf-upload'],
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            console.log('Done! Here is the file info: ', result.info);
            setPdfUrl(result.info.secure_url);
          }
        }
      );

      document.getElementById('upload_widget')?.addEventListener('click', () => {
        myWidget.open();
      }, false);
    }
  }, []);

  return (
    <div>
      <button id="upload_widget" className="cloudinary-button">
        Upload PDF
      </button>
      {pdfUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>PDF URL:</p>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            {pdfUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;