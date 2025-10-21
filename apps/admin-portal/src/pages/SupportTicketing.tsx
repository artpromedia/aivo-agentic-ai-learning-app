import { useState } from 'react';
import { getSupportTickets } from '../utils/mockData';

export default function SupportTicketing() {
  const [tickets] = useState(getSupportTickets());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const handleCreateTicket = () => {
    setShowCreateTicket(true);
  };

  const handleViewTicket = (ticket: any) => {
    // In a real app, navigate to ticket detail page
    alert(`Viewing ticket: ${ticket.id}\n\nSubject: ${ticket.subject}\nDistrict: ${ticket.districtName}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}`);
  };

  const closeModals = () => {
    setShowCreateTicket(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'waiting-user': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-neutral-100 text-neutral-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Support Ticketing</h1>
          <p className="text-neutral-600 mt-1">Manage support tickets and customer communications</p>
        </div>
        <button 
          onClick={handleCreateTicket}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Open Tickets</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{openTickets}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{inProgressTickets}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Response Time</p>
          <p className="text-3xl font-bold text-green-600 mt-2">2.4h</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">CSAT Score</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">4.7</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting-user">Waiting User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-mono text-neutral-600">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900">{ticket.subject}</div>
                    <div className="text-sm text-neutral-500">{ticket.category}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{ticket.districtName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{ticket.assignedTo || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {ticket.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleViewTicket(ticket)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Create New Support Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">District Name</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="Enter district name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="Brief description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Technical Issue</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                  <option>Data/Privacy</option>
                  <option>Training Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-neutral-300 rounded-lg" rows={4} placeholder="Detailed description of the issue"></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={closeModals} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
