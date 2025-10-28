import { useState } from 'react';
import { getStudents } from '../utils/mockData';

interface CreateIEPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (iepData: IEPFormData) => void;
}

export interface IEPFormData {
  learner_id: string;
  case_manager: string;
  date_created: string;
  next_review: string;
  effective_date?: string;
  parent_contact?: string;
  parent_phone?: string;
  parent_email?: string;
  services: ServiceInfo[];
  notes?: string;
  goals: GoalInfo[];
}

interface ServiceInfo {
  service: string;
  frequency: string;
  provider: string;
  duration?: string;
}

interface GoalInfo {
  goal_name: string;
  goal_description?: string;
  category: 'reading' | 'math' | 'social' | 'motor' | 'communication';
  current_level: string;
  target_level: string;
  start_date: string;
  target_date: string;
  accommodations?: string[];
}

export function CreateIEPModal({ isOpen, onClose, onSubmit }: CreateIEPModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<IEPFormData>({
    learner_id: '',
    case_manager: '',
    date_created: new Date().toISOString().split('T')[0],
    next_review: '',
    services: [],
    goals: [],
  });

  const students = getStudents();

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    setStep(1);
    setFormData({
      learner_id: '',
      case_manager: '',
      date_created: new Date().toISOString().split('T')[0],
      next_review: '',
      services: [],
      goals: [],
    });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { service: '', frequency: '', provider: '', duration: '' },
      ],
    });
  };

  const updateService = (index: number, field: keyof ServiceInfo, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, services: newServices });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [
        ...formData.goals,
        {
          goal_name: '',
          category: 'reading',
          current_level: '',
          target_level: '',
          start_date: new Date().toISOString().split('T')[0],
          target_date: '',
          accommodations: [],
        },
      ],
    });
  };

  const updateGoal = (index: number, field: keyof GoalInfo, value: any) => {
    const newGoals = [...formData.goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setFormData({ ...formData, goals: newGoals });
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  const isStep1Valid = formData.learner_id && formData.case_manager && formData.next_review;
  const isStep3Valid = formData.goals.length > 0 && formData.goals.every(
    g => g.goal_name && g.current_level && g.target_level && g.target_date
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Create New IEP</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-white text-indigo-600'
                      : 'bg-indigo-400 text-white'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-white' : 'bg-indigo-400'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Student Info</span>
            <span>Contact & Services</span>
            <span>Goals</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Student Selection & Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Student Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Select Student *
                </label>
                <select
                  value={formData.learner_id}
                  onChange={(e) => setFormData({ ...formData, learner_id: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - Grade {student.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Case Manager *
                </label>
                <input
                  type="text"
                  value={formData.case_manager}
                  onChange={(e) => setFormData({ ...formData, case_manager: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter case manager name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Date Created *
                  </label>
                  <input
                    type="date"
                    value={formData.date_created}
                    onChange={(e) => setFormData({ ...formData, date_created: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Next Review Date *
                  </label>
                  <input
                    type="date"
                    value={formData.next_review}
                    onChange={(e) => setFormData({ ...formData, next_review: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Effective Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.effective_date || ''}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Parent Contact & Services */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Parent Contact & Services</h3>
              
              <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
                <h4 className="font-semibold text-neutral-900">Parent Contact Information</h4>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    value={formData.parent_contact || ''}
                    onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter parent/guardian name"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.parent_phone || ''}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.parent_email || ''}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="parent@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-900">Related Services</h4>
                  <button
                    onClick={addService}
                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    + Add Service
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.services.map((service, index) => (
                    <div key={index} className="bg-neutral-50 rounded-xl p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-neutral-700">Service {index + 1}</span>
                        <button
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Service Type
                          </label>
                          <input
                            type="text"
                            value={service.service}
                            onChange={(e) => updateService(index, 'service', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Speech Therapy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={service.frequency}
                            onChange={(e) => updateService(index, 'frequency', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 2x/week"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Provider
                          </label>
                          <input
                            type="text"
                            value={service.provider}
                            onChange={(e) => updateService(index, 'provider', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Provider name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={service.duration || ''}
                            onChange={(e) => updateService(index, 'duration', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 30 minutes"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.services.length === 0 && (
                    <p className="text-neutral-500 text-center py-8">
                      No services added yet. Click "Add Service" to get started.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">IEP Goals</h3>
                <button
                  onClick={addGoal}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Add Goal
                </button>
              </div>

              <div className="space-y-4">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="bg-neutral-50 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-neutral-700">Goal {index + 1}</span>
                      <button
                        onClick={() => removeGoal(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Goal Name *
                      </label>
                      <input
                        type="text"
                        value={goal.goal_name}
                        onChange={(e) => updateGoal(index, 'goal_name', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Brief goal title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={goal.goal_description || ''}
                        onChange={(e) => updateGoal(index, 'goal_description', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                        placeholder="Detailed goal description"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={goal.category}
                          onChange={(e) => updateGoal(index, 'category', e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="reading">Reading</option>
                          <option value="math">Math</option>
                          <option value="social">Social Skills</option>
                          <option value="motor">Motor Skills</option>
                          <option value="communication">Communication</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Current Level *
                        </label>
                        <input
                          type="text"
                          value={goal.current_level}
                          onChange={(e) => updateGoal(index, 'current_level', e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Current performance level"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Target Level *
                        </label>
                        <input
                          type="text"
                          value={goal.target_level}
                          onChange={(e) => updateGoal(index, 'target_level', e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Target performance level"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Target Date *
                        </label>
                        <input
                          type="date"
                          value={goal.target_date}
                          onChange={(e) => updateGoal(index, 'target_date', e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.goals.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">
                    <p className="text-lg mb-2">No goals added yet</p>
                    <p className="text-sm">At least one goal is required to create an IEP</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Review & Submit</h3>
              
              <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Student Information</h4>
                  <p className="text-neutral-700">
                    Student: {students.find(s => s.id === formData.learner_id)?.name || 'Not selected'}
                  </p>
                  <p className="text-neutral-700">Case Manager: {formData.case_manager}</p>
                  <p className="text-neutral-700">Next Review: {formData.next_review}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Services</h4>
                  <p className="text-neutral-700">{formData.services.length} service(s) added</p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Goals</h4>
                  <p className="text-neutral-700">{formData.goals.length} goal(s) added</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {formData.goals.map((goal, index) => (
                      <li key={index} className="text-neutral-600">
                        {goal.goal_name} ({goal.category})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Add any additional notes or comments..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 rounded-b-2xl flex justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !isStep1Valid}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                (step === 1 && !isStep1Valid)
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStep3Valid}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                !isStep3Valid
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              }`}
            >
              Create IEP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
