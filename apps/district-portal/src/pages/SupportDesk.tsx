import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  supportAPI,
  type SupportTicket,
  type TicketWithReplies,
  type TicketCategory,
  type TicketPriority,
  type SupportStats,
} from '../services/api';

export default function SupportDesk() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    total_tickets: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    urgent_open: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithReplies | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical' as TicketCategory,
    priority: 'medium' as TicketPriority,
  });

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = categoryFilter !== 'all' ? { category: categoryFilter as TicketCategory } : undefined;
      const [ticketsData, statsData] = await Promise.all([
        supportAPI.list(params),
        supportAPI.getStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Failed to load support tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmitTicket = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingTicket(true);
      await supportAPI.create(newTicket);
      await loadTickets();
      setShowNewTicketModal(false);
      setNewTicket({
        title: '',
        description: '',
        category: 'technical',
        priority: 'medium',
      });
    } catch (err) {
      console.error('Failed to create ticket:', err);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleViewTicket = async (ticketId: number) => {
    try {
      const ticketWithReplies = await supportAPI.get(ticketId);
      setSelectedTicket(ticketWithReplies);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      alert('Failed to load ticket details. Please try again.');
    }
  };

  const handleAddReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSubmittingReply(true);
      await supportAPI.addReply(selectedTicket.ticket.id, replyMessage);
      const updatedTicket = await supportAPI.get(selectedTicket.ticket.id);
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredTickets = tickets;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Tickets</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadTickets}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.in_progress}</p>
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
                    <p className="text-sm text-neutral-900">{ticket.submitted_by_name || 'Unknown'}</p>
                    <p className="text-xs text-neutral-500">{ticket.school_name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-neutral-900">{formatDate(ticket.created_at)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewTicket(ticket.id)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
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
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as TicketCategory })}
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
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
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
                  disabled={submittingTicket}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submittingTicket}
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-neutral-900">{selectedTicket.ticket.title}</h2>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-mono">
                      {selectedTicket.ticket.ticket_number}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedTicket.ticket.status === 'open'
                          ? 'bg-amber-100 text-amber-700'
                          : selectedTicket.ticket.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : selectedTicket.ticket.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {selectedTicket.ticket.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedTicket.ticket.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : selectedTicket.ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : selectedTicket.ticket.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {selectedTicket.ticket.priority}
                    </span>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium capitalize">
                      {selectedTicket.ticket.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTicket(null);
                    setReplyMessage('');
                  }}
                  className="text-neutral-400 hover:text-neutral-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Description */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{selectedTicket.ticket.description}</p>
                <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
                  <p>
                    Submitted by <span className="font-medium text-neutral-700">{selectedTicket.ticket.submitted_by_name}</span>
                    {selectedTicket.ticket.school_name && ` from ${selectedTicket.ticket.school_name}`}
                  </p>
                  <p className="mt-1">Created {formatDate(selectedTicket.ticket.created_at)}</p>
                </div>
              </div>

              {/* Replies */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">
                  Conversation ({selectedTicket.replies.length})
                </h3>
                <div className="space-y-3">
                  {selectedTicket.replies.length === 0 ? (
                    <p className="text-sm text-neutral-500 italic">No replies yet</p>
                  ) : (
                    selectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-lg ${
                          reply.is_staff_reply === 'true'
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'bg-neutral-50 border border-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-neutral-900">{reply.author_name}</span>
                            {reply.is_staff_reply === 'true' && (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xs font-medium">
                                Staff
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500">{formatDate(reply.created_at)}</span>
                        </div>
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Reply */}
              <div className="pt-4 border-t border-neutral-200">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Add Reply</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Type your message..."
                  disabled={submittingReply}
                />
                <div className="flex items-center justify-end mt-3">
                  <button
                    onClick={handleAddReply}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submittingReply || !replyMessage.trim()}
                  >
                    {submittingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
