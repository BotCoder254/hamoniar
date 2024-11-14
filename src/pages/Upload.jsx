import React, { useState } from 'react';
import MusicUploader from '../components/MusicUploader/MusicUploader';

const Upload = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(true);
  
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Upload Music</h2>
        <MusicUploader 
          isVisible={isUploaderOpen} 
          onClose={() => setIsUploaderOpen(false)} 
        />
      </section>
    </div>
  );
};

export default Upload; 