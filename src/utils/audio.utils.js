import * as mm from 'music-metadata-browser';

export const extractMetadata = async (file) => {
  try {
    const metadata = await mm.parseBlob(file);
    const duration = metadata.format.duration;
    const picture = metadata.common.picture?.[0];
    
    return {
      title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      year: metadata.common.year,
      genre: metadata.common.genre?.[0],
      duration: formatDuration(duration),
      durationSeconds: duration,
      albumArt: picture ? URL.createObjectURL(new Blob([picture.data])) : null,
      bpm: metadata.common.bpm,
      key: metadata.common.key,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return null;
  }
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const createWaveform = async (audioBuffer) => {
  const peaks = [];
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / 200);
  
  for (let i = 0; i < 200; i++) {
    const start = blockSize * i;
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const abs = Math.abs(channelData[start + j]);
      if (abs > max) max = abs;
    }
    peaks.push(max);
  }
  
  return peaks;
}; 