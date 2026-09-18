import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import DocumentUpload from "../../components/Verification/DocumentUpload";
import { Shield, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState(user?.verification_status || "UNVERIFIED");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerificationComplete = async (data) => {
  setVerificationStatus("VERIFIED");
  setIsVerifying(true);
  
  toast.success("Verification complete! Redirecting...");
  
  // Get pending booking data
  const pendingBookingData = sessionStorage.getItem('pendingBookingData');
  const pendingListingId = sessionStorage.getItem('pendingListingId');
  
  // Clear session storage
  sessionStorage.removeItem('pendingVerification');
  sessionStorage.removeItem('pendingBookingData');
  sessionStorage.removeItem('pendingListingId');
  
  // Always redirect to listings page or dashboard
  setTimeout(() => {
    if (pendingListingId) {
      navigate(`/listings/${pendingListingId}/book`);
    } else {
      // If no pending booking, go to listings page instead of dashboard
      navigate("/listings");
    }
  }, 1500);
};

  const handleBack = () => {
    const pendingListingId = sessionStorage.getItem('pendingListingId');
    
    if (pendingListingId) {
      navigate(`/listings/${pendingListingId}/book`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Identity Verification</h1>
              <p className="text-blue-100 mt-1">
                Verify your identity to start booking and listing
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {verificationStatus === "VERIFIED" && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Verification Complete!</h3>
                <p className="text-green-700 mt-1">
                  Your identity has been verified. Redirecting you back...
                </p>
                {isVerifying && (
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-green-600 text-sm">Redirecting...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {verificationStatus === "REJECTED" && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                <p className="text-red-700 mt-1">
                  Please upload a clear image of your government ID document.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Component - Only show if not verified */}
        {verificationStatus !== "VERIFIED" && (
          <DocumentUpload onVerified={handleVerificationComplete} />
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Why do we need this?</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• Ensure a safe and trusted community</li>
                <li>• Prevent fraudulent activities</li>
                <li>• Verify your identity for bookings</li>
                <li>• Protect both buyers and sellers</li>
              </ul>
              <p className="mt-3 text-xs text-blue-600">
                Your documents are securely stored and encrypted.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Documents */}
        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-700 mb-3">Supported Documents:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-1">🪪</div>
              <span className="text-xs text-gray-600">Passport</span>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-1">🚗</div>
              <span className="text-xs text-gray-600">Driver's License</span>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-1">🆔</div>
              <span className="text-xs text-gray-600">National ID</span>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-1">🏛️</div>
              <span className="text-xs text-gray-600">Government ID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;