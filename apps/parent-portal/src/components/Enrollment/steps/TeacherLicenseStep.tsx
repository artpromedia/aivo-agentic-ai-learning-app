/**
 * Teacher License Step
 * For teachers enrolling students with district bulk licenses
 */
import { useState } from 'react';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';

interface TeacherLicenseStepProps {
  onNext: (data: { licenseKey: string; studentName: string }) => void;
  onBack: () => void;
}

export function TeacherLicenseStep({ onNext, onBack }: TeacherLicenseStepProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      setValidationStatus('invalid');
      setErrorMessage('Please enter a license key');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:9000/api/v1/auth/validate-license/${licenseKey}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.available_seats > 0) {
          setValidationStatus('valid');
        } else if (data.valid && data.available_seats === 0) {
          setValidationStatus('invalid');
          setErrorMessage('This license has no available seats. Please contact your administrator.');
        } else {
          setValidationStatus('invalid');
          setErrorMessage('Invalid license key');
        }
      } else {
        setValidationStatus('invalid');
        setErrorMessage('License key not found');
      }
    } catch (error) {
      setValidationStatus('invalid');
      setErrorMessage('Unable to validate license. Please check your connection.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationStatus !== 'valid') {
      setErrorMessage('Please validate your license key first');
      return;
    }

    if (!studentFirstName.trim() || !studentLastName.trim()) {
      setErrorMessage('Please enter student name');
      return;
    }

    onNext({
      licenseKey: licenseKey.trim(),
      studentName: `${studentFirstName.trim()} ${studentLastName.trim()}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100">
          <Key className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          District License
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter the license code provided by your school or district
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* License Key Input */}
        <div>
          <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-2">
            License Key <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              id="licenseKey"
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value.toUpperCase());
                setValidationStatus('idle');
                setErrorMessage('');
              }}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
              maxLength={19}
              disabled={isValidating || validationStatus === 'valid'}
            />
            <button
              type="button"
              onClick={handleValidateLicense}
              disabled={isValidating || validationStatus === 'valid' || !licenseKey.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isValidating ? 'Validating...' : validationStatus === 'valid' ? 'Validated' : 'Validate'}
            </button>
          </div>

          {/* Validation Status */}
          {validationStatus === 'valid' && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>License validated successfully!</span>
            </div>
          )}
          {validationStatus === 'invalid' && errorMessage && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <p className="mt-2 text-sm text-gray-500">
            Contact your school administrator if you need a license key
          </p>
        </div>

        {/* Student Name (only shown after license validation) */}
        {validationStatus === 'valid' && (
          <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900">Student Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">
              You'll provide additional details in the next steps
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
        
        <button
          type="submit"
          disabled={validationStatus !== 'valid' || !studentFirstName.trim() || !studentLastName.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Student Profile →
        </button>
      </div>
    </form>
  );
}
