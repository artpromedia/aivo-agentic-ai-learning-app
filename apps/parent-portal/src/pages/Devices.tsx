import { useState, type FormEvent, type ChangeEvent } from 'react';

export function Devices() {
  const [devices] = useState([
    {
      id: 1,
      name: "Alex's iPad",
      type: 'Tablet',
      icon: '📱',
      status: 'active',
      lastActive: '2 hours ago',
      usageToday: '1.5 hrs',
      child: 'Alex',
      screenTime: 75,
      maxScreenTime: 120,
    },
    {
      id: 2,
      name: "Emma's iPad",
      type: 'Tablet',
      icon: '📱',
      status: 'active',
      lastActive: '5 hours ago',
      usageToday: '0.8 hrs',
      child: 'Emma',
      screenTime: 48,
      maxScreenTime: 120,
    },
    {
      id: 3,
      name: 'Living Room Tablet',
      type: 'Tablet',
      icon: '📱',
      status: 'inactive',
      lastActive: '3 days ago',
      usageToday: '0 hrs',
      child: 'Shared',
      screenTime: 0,
      maxScreenTime: 120,
    },
  ]);

  const [showAddDevice, setShowAddDevice] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Device Management</h1>
          <p className="text-neutral-600 mt-1">Manage registered devices and screen time limits</p>
        </div>
        <button
          onClick={() => setShowAddDevice(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Device</span>
        </button>
      </div>

      {/* Add Device Modal Overlay */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Add New Device</h2>
            <p className="text-neutral-600 mb-6">
              To add a new device, download the Aivo Learning app on your device and scan this QR code:
            </p>
            <div className="bg-neutral-100 rounded-xl p-8 mb-6 flex items-center justify-center">
              <div className="w-48 h-48 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddDevice(false)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all">
                Download App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devices Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100"
          >
            {/* Device Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                  {device.icon}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{device.name}</h3>
                  <p className="text-sm text-neutral-600">{device.type}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  device.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {device.status === 'active' ? '● Active' : '○ Inactive'}
              </span>
            </div>

            {/* Device Info */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Assigned to:</span>
                <span className="font-semibold text-neutral-900">{device.child}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Last active:</span>
                <span className="font-semibold text-neutral-900">{device.lastActive}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Usage today:</span>
                <span className="font-semibold text-neutral-900">{device.usageToday}</span>
              </div>
            </div>

            {/* Screen Time Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">Screen Time</span>
                <span className="font-semibold text-neutral-900">
                  {device.screenTime} / {device.maxScreenTime} min
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    device.screenTime / device.maxScreenTime > 0.8
                      ? 'bg-red-500'
                      : device.screenTime / device.maxScreenTime > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(device.screenTime / device.maxScreenTime) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                Edit Limits
              </button>
              <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Screen Time Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Default Screen Time Limits</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Daily Screen Time Limit
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="30"
                  max="240"
                  defaultValue="120"
                  className="flex-1"
                />
                <span className="text-lg font-bold text-neutral-900 w-20 text-right">120 min</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Session Time Limit
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="15"
                  max="60"
                  defaultValue="30"
                  className="flex-1"
                />
                <span className="text-lg font-bold text-neutral-900 w-20 text-right">30 min</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center">
              <span className="mr-2">💡</span> Screen Time Tips
            </h3>
            <ul className="text-sm text-neutral-700 space-y-2">
              <li>• Recommended: 30-60 minutes per day for young learners</li>
              <li>• Include breaks every 20-30 minutes</li>
              <li>• Balance screen time with offline activities</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
            Save Changes
          </button>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">All Devices Synced</h3>
              <p className="text-sm text-neutral-600">Last synced 5 minutes ago</p>
            </div>
          </div>
          <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-medium px-6 py-2 rounded-lg border border-neutral-200 transition-colors">
            Force Sync
          </button>
        </div>
      </div>
    </div>
  );
}
