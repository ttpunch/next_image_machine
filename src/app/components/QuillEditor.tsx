"use client";

import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function QuillEditor({ value, onChange, placeholder = 'Write something...' }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [quill, setQuill] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Dynamic import to avoid SSR issues
    import('quill').then((Quill) => {
      if (!editorRef.current || quill) return;

      const quillInstance = new Quill.default(editorRef.current, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link'],
            ['clean']
          ]
        }
      });

      // Set initial content
      if (value) {
        quillInstance.clipboard.dangerouslyPasteHTML(value);
      }

      // Handle content change
      quillInstance.on('text-change', () => {
        const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML;
        if (html) onChange(html);
      });

      setQuill(quillInstance);
    });

    return () => {
      // Clean up if needed
    };
  }, [isClient, onChange, placeholder, quill, value]);

  return (
    <div className="quill-editor-container">
      <div ref={editorRef} className="min-h-[200px]" />
    </div>
  );
}