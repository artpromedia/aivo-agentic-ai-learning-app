import { useState, type FormEvent } from 'react';
import { getSupportTickets } from '../utils/mockData';

export default function SupportDesk() {
  const [tickets, setTickets] = useState(getSupportTickets());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical' as const,
    priority: 'medium' as const,
  });

  const filteredTickets =
    categoryFilter === 'all'
      ? tickets
      : tickets.filter((t) => t.category === categoryFilter);

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  const handleSubmitTicket = (e: FormEvent) => {
    e.preventDefault();
    
    const ticket = {
      id: `TICKET-${tickets.length + 1}`,
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open' as const,
      submittedBy: 'Dr. Sarah Johnson',
      submittedByRole: 'District Admin',
      schoolName: 'District Office',
      createdAt: new Date(),
      lastUpdated: new Date(),
      updatedAt: new Date(),
    };
    
    setTickets([ticket, ...tickets]);
    setShowNewTicketModal(false);
    setNewTicket({
      title: '',
      description: '',
      category: 'technical',
      priority: 'medium',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Support & Help Desk</h1>
          <p className="text-neutral-600 mt-1">
            Get help and submit support requests
          </p>
        </div>
        <button 
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + New Support Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Tickets</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Open</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-xl p-6 shadow-sm border-2 border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all text-left">
          <span className="text-3xl block mb-3">📚</span>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Knowledge Base</h3>
          <p className="text-sm text-neutral-600">
            Browse articles and guides for common questions
          </p>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border-2 border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all text-left">
          <span className="text-3xl block mb-3">🎓</span>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Schedule Training</h3>
          <p className="text-sm text-neutral-600">Book a training session with our team</p>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border-2 border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all text-left">
          <span className="text-3xl block mb-3">💡</span>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Feature Request</h3>
          <p className="text-sm text-neutral-600">
            Suggest new features or improvements
          </p>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({tickets.length})
          </button>
          {['technical', 'training', 'billing', 'feature-request', 'bug-report'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap capitalize ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.replace('-', ' ')} ({tickets.filter((t) => t.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Priority
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-neutral-900">{ticket.title}</p>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {ticket.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium capitalize">
                      {ticket.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : ticket.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'open'
                          ? 'bg-amber-100 text-amber-700'
                          : ticket.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-neutral-900">{ticket.submittedBy}</p>
                    <p className="text-xs text-neutral-500">{ticket.schoolName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-neutral-900">
                      {Math.floor(
                        (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                      )}d ago
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-4xl">🎧</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Need Immediate Assistance?
            </h3>
            <p className="text-sm text-neutral-700 mb-4">
              Our support team is available Monday-Friday, 8:00 AM - 6:00 PM EST
            </p>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                📧 Email Support
              </button>
              <button className="px-4 py-2 bg-white text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm">
                📞 Call: 1-800-AIVO-EDU
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Create New Support Ticket</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Fill out the form below and our team will respond within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmitTicket} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="training">Training Request</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="bug-report">Bug Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Issue affecting some users</option>
                  <option value="high">High - Issue affecting many users</option>
                  <option value="urgent">Urgent - Critical issue affecting everyone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Please provide detailed information about your issue or request..."
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Include any error messages, steps to reproduce, or relevant details
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTicketModal(false);
                    setNewTicket({
                      title: '',
                      description: '',
                      category: 'technical',
                      priority: 'medium',
                    });
                  }}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
