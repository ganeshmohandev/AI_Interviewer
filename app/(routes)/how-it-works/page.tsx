'use client';
import React, { useState } from 'react';
import pdfToText from 'react-pdftotext';
import { useRef } from 'react';
import { pdfjs } from 'react-pdf';
if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

function PDFParserReact() {
  const [pdfText, setPdfText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const extractText = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n\n';
      }
      setPdfText(text.trim());
      setError('');
    } catch (err) {
      setError('Failed to extract text from pdf');
      setPdfText('');
      console.error('Failed to extract text from pdf', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={extractText}
        />
        {pdfText && (
          <div>
            <h3>Extracted Text:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{pdfText}</pre>
          </div>
        )}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </header>
    </div>
  );
}

export default PDFParserReact;