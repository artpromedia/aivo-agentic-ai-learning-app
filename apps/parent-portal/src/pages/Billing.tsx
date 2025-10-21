import { useState } from 'react';

export function Billing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const subscription = {
    plan: 'Pro',
    status: 'active',
    price: billingPeriod === 'monthly' ? '$29/month' : '$290/year',
    nextBilling: 'February 15, 2025',
    paymentMethod: {
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
    },
  };

  const billingHistory = [
    { date: 'Jan 15, 2025', amount: '$29.00', status: 'paid', invoice: 'INV-2025-001' },
    { date: 'Dec 15, 2024', amount: '$29.00', status: 'paid', invoice: 'INV-2024-012' },
    { date: 'Nov 15, 2024', amount: '$29.00', status: 'paid', invoice: 'INV-2024-011' },
    { date: 'Oct 15, 2024', amount: '$29.00', status: 'paid', invoice: 'INV-2024-010' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Billing & Subscription</h1>
        <p className="text-neutral-600 mt-1">Manage your subscription and payment methods</p>
      </div>

      {/* Current Subscription */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-bold text-neutral-900">{subscription.plan} Plan</h2>
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                ● Active
              </span>
            </div>
            <p className="text-lg text-neutral-600">{subscription.price}</p>
          </div>
          <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-6 py-3 rounded-xl border border-neutral-200 transition-all">
            Change Plan
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-neutral-600 mb-1">Next Billing Date</p>
            <p className="text-xl font-bold text-neutral-900">{subscription.nextBilling}</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-neutral-600 mb-1">Billing Cycle</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Payment Method</h2>
          <button className="text-purple-600 hover:text-purple-700 font-medium">
            Update
          </button>
        </div>

        <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl p-6 text-white max-w-md">
          <div className="flex justify-between items-start mb-8">
            <div className="text-sm opacity-80">Credit Card</div>
            <div className="text-2xl font-bold">{subscription.paymentMethod.type}</div>
          </div>
          <div className="mb-6">
            <div className="text-2xl tracking-wider mb-1">
              •••• •••• •••• {subscription.paymentMethod.last4}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <div className="opacity-60 text-xs mb-1">EXPIRES</div>
              <div className="font-semibold">{subscription.paymentMethod.expiry}</div>
            </div>
            <div>
              <div className="opacity-60 text-xs mb-1">CVV</div>
              <div className="font-semibold">•••</div>
            </div>
          </div>
        </div>

        <button className="mt-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
          <span>+</span>
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Billing History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Invoice</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((transaction, index) => (
                <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-neutral-900">{transaction.date}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-neutral-900">{transaction.amount}</td>
                  <td className="py-4 px-4">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-neutral-600 font-mono">{transaction.invoice}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">This Month's Usage</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              👥
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">2</p>
            <p className="text-sm text-neutral-600">Active Children</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              📱
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">3 / 5</p>
            <p className="text-sm text-neutral-600">Devices Used</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              ⏰
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">24.5</p>
            <p className="text-sm text-neutral-600">Hours Learning</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              📊
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">5</p>
            <p className="text-sm text-neutral-600">Reports Generated</p>
          </div>
        </div>
      </div>

      {/* Cancel Subscription */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Cancel Subscription</h2>
            <p className="text-neutral-600 text-sm mb-4">
              Cancel anytime. Your access will continue until {subscription.nextBilling}.
            </p>
            <p className="text-neutral-600 text-sm">
              <strong>Note:</strong> Your child's personalized AI model and progress data will be preserved.
            </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
            Cancel Plan
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
            💬
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">Need Help with Billing?</h3>
            <p className="text-sm text-neutral-700 mb-3">
              Our support team is here to help with any billing questions or issues.
            </p>
            <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-medium px-6 py-2 rounded-lg border border-neutral-200 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
