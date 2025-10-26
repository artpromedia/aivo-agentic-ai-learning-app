import type { StepProps } from '../EnrollmentWizard';

export function BasicInfoStep({ data, onUpdate, errors }: StepProps) {
  const grades = [
    'Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th',
    '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Name Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-semibold text-neutral-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            data-testid="first-name"
            type="text"
            value={data.firstName || ''}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            placeholder="Enter first name"
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.firstName ? 'border-red-500 bg-red-50' : 'border-neutral-300'
            }`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span> {errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-semibold text-neutral-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            data-testid="last-name"
            type="text"
            value={data.lastName || ''}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            placeholder="Enter last name"
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.lastName ? 'border-red-500 bg-red-50' : 'border-neutral-300'
            }`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span> {errors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Preferred Name */}
      <div className="space-y-2">
        <label htmlFor="preferredName" className="block text-sm font-semibold text-neutral-700">
          Preferred Name (Optional)
        </label>
        <input
          id="preferredName"
          type="text"
          value={data.preferredName || ''}
          onChange={(e) => onUpdate({ preferredName: e.target.value })}
          placeholder="What should we call them?"
          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          💡 If different from first name, this is how they'll be greeted in the app
        </p>
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <label htmlFor="dob" className="block text-sm font-semibold text-neutral-700">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          id="dob"
          type="date"
          data-testid="date-of-birth"
          value={data.dateOfBirth || ''}
          onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.dateOfBirth ? 'border-red-500 bg-red-50' : 'border-neutral-300'
          }`}
        />
        {data.dateOfBirth && !errors.dateOfBirth && (
          <p className="text-sm text-neutral-600 flex items-center gap-1">
            🎂 Age: {calculateAge(data.dateOfBirth)} years old
          </p>
        )}
        {errors.dateOfBirth && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span> {errors.dateOfBirth}
          </p>
        )}
      </div>

      {/* Grade */}
      <div className="space-y-2">
        <label htmlFor="grade" className="block text-sm font-semibold text-neutral-700">
          Current Grade <span className="text-red-500">*</span>
        </label>
        <select
          id="grade"
          data-testid="grade-select"
          value={data.grade || ''}
          onChange={(e) => onUpdate({ grade: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.grade ? 'border-red-500 bg-red-50' : 'border-neutral-300'
          }`}
        >
          <option value="">Select grade level</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade} Grade
            </option>
          ))}
        </select>
        {errors.grade && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span> {errors.grade}
          </p>
        )}
      </div>

      {/* Gender (Optional) */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-neutral-700">
          Gender (Optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'male', label: 'Male', icon: '👦' },
            { value: 'female', label: 'Female', icon: '👧' },
            { value: 'other', label: 'Other', icon: '🧑' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '❓' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.gender === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={data.gender === option.value}
                onChange={(e) => onUpdate({ gender: e.target.value as 'male' | 'female' | 'other' | 'prefer-not-to-say' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Info Alert */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            This information helps us personalize the learning experience and ensure age-appropriate content.
          </div>
        </div>
      </div>
    </div>
  );
}
