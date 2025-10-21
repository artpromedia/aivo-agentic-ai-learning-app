import { type FormEvent, useState } from 'react';

type Invitation = {
  id: number;
  email: string;
  role: string;
  sentDate: string;
  status: string;
};

type FamilyMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  joinedDate: string;
  status: string;
};

export function Invitations() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'view' | 'manage'>('view');
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([
    { id: 1, email: 'grandma@example.com', role: 'View Only', sentDate: '2 days ago', status: 'pending' },
    { id: 2, email: 'john.doe@example.com', role: 'Full Access', sentDate: '1 week ago', status: 'pending' },
  ]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: 1,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'Parent',
      avatar: '👩',
      joinedDate: 'Owner',
      status: 'active',
    },
    {
      id: 2,
      name: 'Michael Doe',
      email: 'michael.doe@example.com',
      role: 'Co-Parent',
      avatar: '👨',
      joinedDate: '3 months ago',
      status: 'active',
    },
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'remove'; item: Invitation | FamilyMember } | null>(null);

  const handleSendInvitation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add new invitation to pending list
    const newInvitation = {
      id: pendingInvitations.length + 1,
      email: email,
      role: role === 'view' ? 'View Only' : 'Full Access',
      sentDate: 'Just now',
      status: 'pending' as const,
    };
    setPendingInvitations([...pendingInvitations, newInvitation]);
    setEmail('');
  };

  const handleResendInvitation = (invitation: Invitation) => {
    // Simulate resending email
    alert(`Invitation resent to ${invitation.email}`);
  };

  const handleCancelInvitation = (invitation: Invitation) => {
    setConfirmAction({ type: 'cancel', item: invitation });
    setShowConfirmModal(true);
  };

  const handleRemoveMember = (member: FamilyMember) => {
    setConfirmAction({ type: 'remove', item: member });
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'cancel') {
      // Remove invitation from pending list
      setPendingInvitations(pendingInvitations.filter(inv => inv.id !== confirmAction.item.id));
    } else if (confirmAction.type === 'remove') {
      // Remove member from family list
      setFamilyMembers(familyMembers.filter(mem => mem.id !== confirmAction.item.id));
    }

    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Family & Invitations</h1>
        <p className="text-neutral-600 mt-1">Invite family members to collaborate on your child's learning</p>
      </div>

      {/* Send Invitation Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Invite a Family Member</h2>
        <p className="text-neutral-600 mb-6">
          Share your child's progress with co-parents, grandparents, or caregivers
        </p>
        
        <form onSubmit={handleSendInvitation} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="family@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'view' | 'manage')}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              >
                <option value="view">View Only</option>
                <option value="manage">Full Access</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-2">Permission Details:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-neutral-700 mb-1">View Only:</p>
                <ul className="text-neutral-600 space-y-1">
                  <li>• View progress reports</li>
                  <li>• See activity history</li>
                  <li>• Receive notifications</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-neutral-700 mb-1">Full Access:</p>
                <ul className="text-neutral-600 space-y-1">
                  <li>• All "View Only" permissions</li>
                  <li>• Manage device settings</li>
                  <li>• Update learning preferences</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>✉️</span>
            <span>Send Invitation</span>
          </button>
        </form>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {pendingInvitations.map((invitation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-2xl">
                    ⏳
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{invitation.email}</p>
                    <p className="text-sm text-neutral-600">
                      {invitation.role} • Sent {invitation.sentDate}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleResendInvitation(invitation)}
                    className="bg-white hover:bg-neutral-50 text-neutral-900 font-medium px-4 py-2 rounded-lg text-sm border border-neutral-200 transition-colors"
                  >
                    Resend
                  </button>
                  <button 
                    onClick={() => handleCancelInvitation(invitation)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Family Members */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Family Members</h2>
        <div className="space-y-3">
          {familyMembers.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:border-purple-200 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
                  {member.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-neutral-900">{member.name}</p>
                    {member.role === 'Parent' && (
                      <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">{member.email}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {member.role} • Joined {member.joinedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  ● Active
                </span>
                {member.role !== 'Parent' && (
                  <button 
                    onClick={() => handleRemoveMember(member)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
            ℹ️
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">About Family Sharing</h3>
            <p className="text-sm text-neutral-700 mb-3">
              Family members with access can view your child's progress and receive updates about their learning journey. 
              You can manage their permissions at any time.
            </p>
            <p className="text-sm text-neutral-700">
              <strong>Security note:</strong> All family members must verify their email before gaining access.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {confirmAction.type === 'cancel' ? 'Cancel Invitation?' : 'Remove Family Member?'}
              </h2>
              <p className="text-neutral-600">
                {confirmAction.type === 'cancel' 
                  ? `Are you sure you want to cancel the invitation to ${'email' in confirmAction.item ? confirmAction.item.email : ''}? They will no longer be able to accept it.`
                  : `Are you sure you want to remove ${'name' in confirmAction.item ? confirmAction.item.name : ''} from your family sharing? They will lose access to your child's progress.`
                }
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold rounded-xl transition-colors"
              >
                Keep {confirmAction.type === 'cancel' ? 'Invitation' : 'Member'}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                {confirmAction.type === 'cancel' ? 'Cancel Invitation' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
