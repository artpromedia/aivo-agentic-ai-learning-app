import { useState } from 'react';

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);

  const conversations = [
    { id: 1, parent: 'Jane Johnson', student: 'Alex Johnson', preview: 'Thank you for the update...', time: '2h ago', unread: 2 },
    { id: 2, parent: 'Michael Davis', student: 'Emma Davis', preview: 'When is the next IEP meeting?', time: '1d ago', unread: 0 },
    { id: 3, parent: 'Sarah Brown', student: 'Liam Brown', preview: "I've noticed improvements...", time: '2d ago', unread: 1 },
  ];

  const messages = [
    { from: 'Jane Johnson', text: "Hi Ms. Smith, thank you for the progress update on Alex's reading.", time: '2:30 PM', isMe: false },
    { from: 'You', text: "You're welcome! Alex has been doing great with phonics.", time: '2:45 PM', isMe: true },
    { from: 'Jane Johnson', text: 'What activities would you recommend we do at home?', time: '3:00 PM', isMe: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
        <p className="text-neutral-600 mt-1">Communicate with parents and guardians</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="grid md:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className="border-r border-neutral-200 overflow-y-auto">
            <div className="p-4 border-b border-neutral-200">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
              />
            </div>
            <div className="divide-y divide-neutral-100">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors ${
                    selectedConversation === conv.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-neutral-900">{conv.parent}</p>
                    {conv.unread > 0 && (
                      <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mb-1">Re: {conv.student}</p>
                  <p className="text-sm text-neutral-600 truncate">{conv.preview}</p>
                  <p className="text-xs text-neutral-500 mt-1">{conv.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                  <p className="font-bold text-neutral-900">Jane Johnson</p>
                  <p className="text-sm text-neutral-600">Parent of Alex Johnson</p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-sm p-3 rounded-2xl ${
                        msg.isMe ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-900'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.isMe ? 'text-indigo-200' : 'text-neutral-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-neutral-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
