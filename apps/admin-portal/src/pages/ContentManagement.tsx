import { useState } from 'react';
import { getContentItems, type ContentItem } from '../utils/mockData';

interface ContentFormData {
  title: string;
  type: string;
  subject: string;
  gradeLevel: string;
  difficultyLevel: string;
  description: string;
}

export default function ContentManagement() {
  const [content, setContent] = useState(getContentItems());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    type: 'activity',
    subject: '',
    gradeLevel: '',
    difficultyLevel: 'beginner',
    description: '',
  });

  const filteredContent = content.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const handleAddContent = () => {
    setFormData({
      title: '',
      type: 'activity',
      subject: '',
      gradeLevel: '',
      difficultyLevel: 'beginner',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleEditContent = (item: any) => {
    setSelectedContent(item);
    setFormData({
      title: item.title,
      type: item.type,
      subject: item.subject,
      gradeLevel: item.gradeLevel,
      difficultyLevel: item.difficultyLevel,
      description: item.description || '',
    });
    setShowEditModal(true);
  };

  const handleViewContent = (item: any) => {
    setSelectedContent(item);
    setShowViewModal(true);
  };

  const handleSaveContent = () => {
    if (showAddModal) {
      const newContent = {
        id: `content-${Date.now()}`,
        ...formData,
        status: 'draft',
        createdAt: new Date(),
        usageCount: 0,
        rating: 0,
      };
      setContent([...content, newContent] as any);
      setShowAddModal(false);
    } else {
      setContent(content.map(c => 
        c.id === selectedContent?.id ? { ...c, ...formData, status: 'review' } as ContentItem : c
      ));
      setShowEditModal(false);
    }
  };

  const handlePublish = (contentId: string) => {
    setContent(content.map(c => 
      c.id === contentId ? { ...c, status: 'published' } : c
    ) as any);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedContent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage content library and learning materials</p>
        </div>
        <button 
          onClick={handleAddContent}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex items-center gap-2">
            <span>+</span>
            <span>Add Content</span>
          </span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex gap-4">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-neutral-300 rounded-lg">
            <option value="all">All Types</option>
            <option value="activity">Activity</option>
            <option value="assessment">Assessment</option>
            <option value="reading">Reading</option>
            <option value="math">Math</option>
            <option value="speech">Speech</option>
            <option value="science">Science</option>
            <option value="writing">Writing</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-neutral-300 rounded-lg">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                {item.type}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                item.status === 'published' ? 'bg-green-100 text-green-700' :
                item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                item.status === 'review' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {item.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{item.title}</h3>
            <div className="space-y-1.5 text-sm text-gray-600 mb-4">
              <p className="flex items-center gap-2">
                <span className="text-gray-400 min-w-[70px]">Subject:</span>
                <span className="font-medium text-gray-700">{item.subject}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400 min-w-[70px]">Grade:</span>
                <span className="font-medium text-gray-700">{item.gradeLevel}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400 min-w-[70px]">Difficulty:</span>
                <span className="font-medium text-gray-700 capitalize">{item.difficultyLevel}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400 min-w-[70px]">Usage:</span>
                <span className="font-medium text-gray-700">{item.usageCount} times</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400 min-w-[70px]">Rating:</span>
                <span className="font-medium text-gray-700">{item.rating.toFixed(1)} ⭐</span>
              </p>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleEditContent(item)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => handleViewContent(item)}
                className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Content Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {showAddModal ? 'Add New Content' : 'Edit Content'}
              </h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Counting Numbers 1-10"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="activity">Activity</option>
                    <option value="assessment">Assessment</option>
                    <option value="reading">Reading</option>
                    <option value="math">Math</option>
                    <option value="speech">Speech</option>
                    <option value="science">Science</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    placeholder="e.g., K-2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the learning objectives and content..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {showAddModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Content File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm">
                        <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-gray-500">PDF, DOCx, or ZIP up to 50MB</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> Content will be saved as "Draft" and requires approval before publishing.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={closeModals}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveContent}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md"
              >
                {showAddModal ? 'Add Content' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Content Modal */}
      {showViewModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Content Details</h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                    {selectedContent.type}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                    selectedContent.status === 'published' ? 'bg-green-100 text-green-700' :
                    selectedContent.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    selectedContent.status === 'review' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedContent.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Subject</p>
                  <p className="text-base font-semibold text-gray-900">{selectedContent.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Grade Level</p>
                  <p className="text-base font-semibold text-gray-900">{selectedContent.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Difficulty</p>
                  <p className="text-base font-semibold text-gray-900 capitalize">{selectedContent.difficultyLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  <p className="text-base font-semibold text-gray-900">{selectedContent.rating.toFixed(1)} ⭐</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedContent.usageCount}</p>
                    <p className="text-xs text-gray-600 mt-1">Times Used</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedContent.rating.toFixed(1)}</p>
                    <p className="text-xs text-gray-600 mt-1">Avg Rating</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedContent.createdAt?.toLocaleDateString() || 'N/A'}</p>
                    <p className="text-xs text-gray-600 mt-1">Created</p>
                  </div>
                </div>
              </div>

              {selectedContent.standards && selectedContent.standards.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Standards Alignment</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.standards.map((standard: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {standard}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedContent.accessibilityFeatures && selectedContent.accessibilityFeatures.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Accessibility Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.accessibilityFeatures.map((feature: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={closeModals}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleEditContent(selectedContent)}
                className="px-5 py-2.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
              >
                Edit Content
              </button>
              {selectedContent.status !== 'published' && (
                <button 
                  onClick={() => { handlePublish(selectedContent.id); closeModals(); }}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-all hover:shadow-md"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
