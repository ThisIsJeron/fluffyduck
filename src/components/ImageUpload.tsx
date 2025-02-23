
import { UploadCloud } from "lucide-react";
import { useCallback } from "react";

interface ImageUploadProps {
  value: string[];
  onChange: (files: File[]) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      onChange(files);
    },
    [onChange]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onChange(files);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={onFileChange}
        accept="image/*"
        multiple
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          <span>Upload a file</span> or drag and drop
        </h3>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </label>
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {value.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Uploaded preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
}
