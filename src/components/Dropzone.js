import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Dropzone() {
  const onDrop = useCallback(() => {
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p className="dropzone">
          Drag and drop some files here, or click to select files
        </p>
      )}
    </div>
  );
}
