import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { verificationClient } from "../../api/clients";
import { Upload, X, CheckCircle, AlertCircle, Loader, Camera, FileImage } from "lucide-react";
import toast from "react-hot-toast";

const DocumentUpload = ({ onVerified }) => {
  const [documentType, setDocumentType] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [ocrData, setOcrData] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    
    // Validate file size (max 5MB)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentType) {
      toast.error("Please select document type");
      return;
    }
    if (!fullName) {
      toast.error("Please enter your full name");
      return;
    }
    if (!documentNumber) {
      toast.error("Please enter document number");
      return;
    }
    if (!file) {
      toast.error("Please upload a document image");
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);
    formData.append("fullName", fullName);
    formData.append("documentNumber", documentNumber);

    try {
      const response = await verificationClient.post("/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setVerificationStatus("verified");
        setOcrData(response.data.data.extractedData);
        toast.success("Document verified successfully!");
        
        if (onVerified) {
          onVerified(response.data.data);
        }
      } else {
        setVerificationStatus("failed");
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setVerificationStatus("failed");
      toast.error(error.response?.data?.message || "Failed to verify document");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setVerificationStatus(null);
    setOcrData(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
      <p className="text-gray-600 mb-6">Upload a clear image of your government-issued ID</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select document type</option>
            <option value="passport">Passport</option>
            <option value="driver_license">Driver's License</option>
            <option value="national_id">National ID Card</option>
            <option value="govt_id">Government ID</option>
          </select>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="As it appears on the document"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
            placeholder="ID/Passport number"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Document <span className="text-red-500">*</span>
          </label>
          
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                ${isDragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
            >
              <input {...getInputProps()} />
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isDragActive
                  ? "Drop the document here"
                  : "Drag & drop or click to select"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supports: JPG, PNG (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              {preview && (
                <img
                  src={preview}
                  alt="Document preview"
                  className="w-full max-h-64 object-contain bg-gray-50"
                />
              )}
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {fileRejections.length > 0 && (
            <p className="mt-2 text-sm text-red-600">
              {fileRejections[0]?.errors[0]?.message}
            </p>
          )}
        </div>

        {/* OCR Extracted Data Preview */}
        {ocrData && Object.keys(ocrData).length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Extracted Information</h4>
            </div>
            <div className="space-y-2 text-sm">
              {ocrData.passportNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Passport Number:</span>
                  <span className="font-medium text-gray-800">{ocrData.passportNumber}</span>
                </div>
              )}
              {ocrData.licenseNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">License Number:</span>
                  <span className="font-medium text-gray-800">{ocrData.licenseNumber}</span>
                </div>
              )}
              {ocrData.idNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Number:</span>
                  <span className="font-medium text-gray-800">{ocrData.idNumber}</span>
                </div>
              )}
              {ocrData.fullName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{ocrData.fullName}</span>
                </div>
              )}
              {ocrData.firstName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">First Name:</span>
                  <span className="font-medium text-gray-800">{ocrData.firstName}</span>
                </div>
              )}
              {ocrData.lastName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Name:</span>
                  <span className="font-medium text-gray-800">{ocrData.lastName}</span>
                </div>
              )}
              {ocrData.dateOfBirth && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="font-medium text-gray-800">{ocrData.dateOfBirth}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus === "verified" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-700">Document verified successfully! Redirecting...</p>
          </div>
        )}

        {verificationStatus === "failed" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">Verification failed. Please upload a clearer image of your document.</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || verificationStatus === "verified"}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-1 shadow-lg"
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Verifying Document...
            </div>
          ) : verificationStatus === "verified" ? (
            "Verified ✓"
          ) : (
            "Verify Document"
          )}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;