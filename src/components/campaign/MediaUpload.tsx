
import { Upload } from "lucide-react";
import { UploadedFile } from "@/types/campaign";

interface MediaUploadProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const MediaUpload = ({ uploadedFiles, onFileUpload, onRemoveFile }: MediaUploadProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-fit">

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center h-60 flex items-center justify-center">
        <input
          type="file"
          id="media-upload"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={onFileUpload}
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600">
            Drop your media files here or{" "}
            <span className="text-accent font-medium">browse</span>
          </span>
          <span className="text-sm text-gray-400 mt-1">
            Supports JPG, PNG, GIF, WEBP
          </span>
        </label>
      </div>

      {uploadedFiles && uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={file.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onRemoveFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
