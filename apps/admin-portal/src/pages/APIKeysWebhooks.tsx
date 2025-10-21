import { useState } from 'react';
import type { APIKey, Webhook, APIPermission, WebhookEvent } from '@aivo/types';
import { Button, Card, Input, Modal, Tabs, Tab } from '@aivo/ui';
import { auditLog, getCurrentActor } from '@aivo/utils';

// Mock data (would come from backend)
const initialApiKeys: APIKey[] = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'ak_live_1234567890abcdef',
    keyPrefix: 'ak_live_1234...',
    environment: 'production',
    createdAt: new Date('2024-01-15'),
    createdBy: 'alice@aivo.ai',
    lastUsedAt: new Date('2025-01-19'),
    status: 'active',
    permissions: ['learners.read', 'progress.read', 'activities.read'],
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
    },
    usage: {
      totalRequests: 45230,
      lastDayRequests: 850,
      lastMonthRequests: 12400,
    },
  },
];

const initialWebhooks: Webhook[] = [
  {
    id: 'wh_1',
    name: 'Progress Updates',
    url: 'https://api.example.com/webhooks/aivo',
    events: ['progress.updated', 'activity.completed'],
    status: 'active',
    secret: 'whsec_abcdef1234567890',
    createdAt: new Date('2024-02-01'),
    createdBy: 'alice@aivo.ai',
    lastTriggeredAt: new Date('2025-01-19T08:30:00'),
    lastStatus: {
      timestamp: new Date('2025-01-19T08:30:00'),
      statusCode: 200,
      success: true,
    },
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 60,
    },
    statistics: {
      totalTriggers: 1240,
      successfulTriggers: 1235,
      failedTriggers: 5,
      averageResponseTime: 185,
    },
  },
];

export function APIKeysWebhooksPage() {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'webhooks'>('api-keys');
  const [apiKeys, setApiKeys] = useState<APIKey[]>(initialApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);

  return (
    <div className="space-y-6" data-testid="api-keys-webhooks-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">API Keys & Webhooks</h1>
        <p className="text-neutral-600 mt-1">
          Manage API access and webhook integrations
        </p>
      </div>

      <Tabs value={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)}>
        <Tab value="api-keys" label="API Keys" count={apiKeys.length}>
          <APIKeysSection apiKeys={apiKeys} setApiKeys={setApiKeys} />
        </Tab>
        <Tab value="webhooks" label="Webhooks" count={webhooks.length}>
          <WebhooksSection webhooks={webhooks} setWebhooks={setWebhooks} />
        </Tab>
      </Tabs>
    </div>
  );
}

interface APIKeysSectionProps {
  apiKeys: APIKey[];
  setApiKeys: (keys: APIKey[]) => void;
}

function APIKeysSection({ apiKeys, setApiKeys }: APIKeysSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdKey, setCreatedKey] = useState<APIKey | null>(null);

  const handleCreateKey = (
    name: string,
    environment: 'production' | 'sandbox',
    permissions: APIPermission[]
  ) => {
    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name,
      key: `ak_${environment === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 24)}`,
      keyPrefix: `ak_${environment === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 4)}...`,
      environment,
      createdAt: new Date(),
      createdBy: 'current-user@aivo.ai',
      status: 'active',
      permissions,
      rateLimit: {
        requestsPerMinute: environment === 'production' ? 100 : 20,
        requestsPerDay: environment === 'production' ? 10000 : 1000,
      },
      usage: {
        totalRequests: 0,
        lastDayRequests: 0,
        lastMonthRequests: 0,
      },
    };

    setApiKeys([...apiKeys, newKey]);
    setCreatedKey(newKey);
    setShowCreateModal(false);

    // Audit log
    auditLog.log({
      eventType: 'api_key.created',
      category: 'settings',
      severity: 'info',
      actor: getCurrentActor(),
      target: { type: 'api_key', id: newKey.id, name: newKey.name },
      action: `Created API key "${name}" for ${environment}`,
      metadata: { permissions },
      status: 'success',
    });
  };

  const handleRevokeKey = (keyId: string) => {
    if (!window.confirm('Revoke this API key? Applications using it will stop working.')) {
      return;
    }

    setApiKeys(
      apiKeys.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k))
    );

    // Audit log
    const key = apiKeys.find((k) => k.id === keyId);
    auditLog.log({
      eventType: 'api_key.revoked',
      category: 'settings',
      severity: 'warning',
      actor: getCurrentActor(),
      target: { type: 'api_key', id: keyId, name: key?.name },
      action: `Revoked API key "${key?.name}"`,
      metadata: {},
      status: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          onClick={() => setShowCreateModal(true)}
          data-testid="create-api-key"
        >
          + Create API Key
        </button>
      </div>

      {apiKeys.map((key) => (
        <Card key={key.id} padding="lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{key.name}</h3>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    key.environment === 'production'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }
                `}
                >
                  {key.environment}
                </span>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    key.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                `}
                >
                  {key.status}
                </span>
              </div>

              <div className="font-mono text-sm bg-neutral-100 px-3 py-2 rounded">
                {key.keyPrefix}
              </div>
            </div>

            {key.status === 'active' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevokeKey(key.id)}
                data-testid={`revoke-${key.id}`}
              >
                Revoke
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-neutral-600 mb-1">Created</div>
              <div className="text-sm font-medium">
                {new Date(key.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-neutral-600 mb-1">Last Used</div>
              <div className="text-sm font-medium">
                {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
              </div>
            </div>

            <div>
              <div className="text-sm text-neutral-600 mb-1">Total Requests</div>
              <div className="text-sm font-medium">
                {key.usage.totalRequests.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Permissions</div>
            <div className="flex flex-wrap gap-2">
              {key.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Rate Limits</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">Per Minute:</span>
                <span className="ml-2 font-medium">{key.rateLimit.requestsPerMinute}</span>
              </div>
              <div>
                <span className="text-neutral-600">Per Day:</span>
                <span className="ml-2 font-medium">{key.rateLimit.requestsPerDay}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Create Modal */}
      <CreateAPIKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateKey}
      />

      {/* Show Key Once Modal */}
      {createdKey && <ShowAPIKeyModal apiKey={createdKey} onClose={() => setCreatedKey(null)} />}
    </div>
  );
}

interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, env: 'production' | 'sandbox', permissions: APIPermission[]) => void;
}

function CreateAPIKeyModal({ isOpen, onClose, onCreate }: CreateAPIKeyModalProps) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('sandbox');
  const [selectedPermissions, setSelectedPermissions] = useState<APIPermission[]>([]);

  const allPermissions: { id: APIPermission; label: string; description: string }[] = [
    { id: 'learners.read', label: 'Read Learners', description: 'View learner profiles and basic info' },
    { id: 'learners.write', label: 'Write Learners', description: 'Create and update learner profiles' },
    { id: 'progress.read', label: 'Read Progress', description: 'View learner progress and analytics' },
    { id: 'iep.read', label: 'Read IEPs', description: 'View IEP goals and accommodations' },
    { id: 'iep.write', label: 'Write IEPs', description: 'Create and update IEP goals' },
    { id: 'activities.read', label: 'Read Activities', description: 'View activity data' },
    { id: 'activities.write', label: 'Write Activities', description: 'Create and assign activities' },
    { id: 'analytics.read', label: 'Read Analytics', description: 'Access analytics and reports' },
    { id: 'webhooks.manage', label: 'Manage Webhooks', description: 'Create and manage webhooks' },
  ];

  const handleSubmit = () => {
    if (!name || selectedPermissions.length === 0) {
      alert('Please provide a name and select at least one permission');
      return;
    }

    onCreate(name, environment, selectedPermissions);
    setName('');
    setEnvironment('sandbox');
    setSelectedPermissions([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create API Key" size="large">
      <div className="space-y-4">
        <Input
          label="Key Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production Integration"
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Environment</label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`
              flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition
              ${environment === 'sandbox' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}
            `}
            >
              <input
                type="radio"
                checked={environment === 'sandbox'}
                onChange={() => setEnvironment('sandbox')}
              />
              <div>
                <div className="font-medium">Sandbox</div>
                <div className="text-xs text-neutral-600">For testing and development</div>
              </div>
            </label>

            <label
              className={`
              flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition
              ${environment === 'production' ? 'border-green-500 bg-green-50' : 'border-neutral-200'}
            `}
            >
              <input
                type="radio"
                checked={environment === 'production'}
                onChange={() => setEnvironment('production')}
              />
              <div>
                <div className="font-medium">Production</div>
                <div className="text-xs text-neutral-600">For live applications</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Permissions</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allPermissions.map((perm) => (
              <label
                key={perm.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition
                  ${selectedPermissions.includes(perm.id) ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPermissions([...selectedPermissions, perm.id]);
                    } else {
                      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm.id));
                    }
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">{perm.label}</div>
                  <div className="text-xs text-neutral-600">{perm.description}</div>
                  <div className="text-xs font-mono text-neutral-500 mt-1">{perm.id}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create API Key
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface ShowAPIKeyModalProps {
  apiKey: APIKey;
  onClose: () => void;
}

function ShowAPIKeyModal({ apiKey, onClose }: ShowAPIKeyModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="API Key Created" size="medium">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-900 mb-1">Save this API key now</p>
              <p className="text-sm text-yellow-800">
                This is the only time you'll be able to see the full key. Store it securely.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <div className="flex gap-2">
            <div className="flex-1 font-mono text-sm bg-neutral-100 px-3 py-3 rounded border">
              {apiKey.key}
            </div>
            <Button variant="outline" onClick={handleCopy} data-testid="copy-api-key">
              {copied ? '✓ Copied' : '📋 Copy'}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="primary" onClick={onClose}>
            I've Saved the Key
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface WebhooksSectionProps {
  webhooks: Webhook[];
  setWebhooks: (webhooks: Webhook[]) => void;
}

function WebhooksSection({ webhooks, setWebhooks }: WebhooksSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateWebhook = (
    name: string,
    url: string,
    events: WebhookEvent[],
    maxRetries: number,
    retryDelay: number
  ) => {
    const newWebhook: Webhook = {
      id: `wh_${Date.now()}`,
      name,
      url,
      events,
      status: 'active',
      secret: `whsec_${Math.random().toString(36).substr(2, 24)}`,
      createdAt: new Date(),
      createdBy: 'current-user@aivo.ai',
      retryPolicy: {
        maxRetries,
        retryDelay,
      },
      statistics: {
        totalTriggers: 0,
        successfulTriggers: 0,
        failedTriggers: 0,
        averageResponseTime: 0,
      },
    };

    setWebhooks([...webhooks, newWebhook]);
    setShowCreateModal(false);

    // Audit log
    auditLog.log({
      eventType: 'webhook.created',
      category: 'settings',
      severity: 'info',
      actor: getCurrentActor(),
      target: { type: 'webhook', id: newWebhook.id, name: newWebhook.name },
      action: `Created webhook "${name}"`,
      metadata: { url, events },
      status: 'success',
    });
  };

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(
      webhooks.map((wh) =>
        wh.id === webhookId
          ? { ...wh, status: wh.status === 'active' ? ('disabled' as const) : ('active' as const) }
          : wh
      )
    );
  };

  const handleDeleteWebhook = (webhookId: string) => {
    if (!window.confirm('Delete this webhook? This action cannot be undone.')) {
      return;
    }

    const webhook = webhooks.find((wh) => wh.id === webhookId);
    setWebhooks(webhooks.filter((wh) => wh.id !== webhookId));

    // Audit log
    auditLog.log({
      eventType: 'webhook.deleted',
      category: 'settings',
      severity: 'warning',
      actor: getCurrentActor(),
      target: { type: 'webhook', id: webhookId, name: webhook?.name },
      action: `Deleted webhook "${webhook?.name}"`,
      metadata: {},
      status: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          onClick={() => setShowCreateModal(true)}
          data-testid="create-webhook"
        >
          + Create Webhook
        </button>
      </div>

      {webhooks.map((webhook) => (
        <Card key={webhook.id} padding="lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{webhook.name}</h3>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    webhook.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : webhook.status === 'disabled'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                  }
                `}
                >
                  {webhook.status}
                </span>
              </div>

              <div className="text-sm text-neutral-600 break-all">{webhook.url}</div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleWebhook(webhook.id)}
                data-testid={`toggle-${webhook.id}`}
              >
                {webhook.status === 'active' ? 'Disable' : 'Enable'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteWebhook(webhook.id)}
                data-testid={`delete-${webhook.id}`}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-neutral-600 mb-1">Total Triggers</div>
              <div className="text-sm font-medium">
                {webhook.statistics.totalTriggers.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-neutral-600 mb-1">Success Rate</div>
              <div className="text-sm font-medium">
                {webhook.statistics.totalTriggers > 0
                  ? Math.round(
                      (webhook.statistics.successfulTriggers / webhook.statistics.totalTriggers) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>

            <div>
              <div className="text-sm text-neutral-600 mb-1">Avg Response</div>
              <div className="text-sm font-medium">{webhook.statistics.averageResponseTime}ms</div>
            </div>

            <div>
              <div className="text-sm text-neutral-600 mb-1">Last Triggered</div>
              <div className="text-sm font-medium">
                {webhook.lastTriggeredAt
                  ? new Date(webhook.lastTriggeredAt).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Events</div>
            <div className="flex flex-wrap gap-2">
              {webhook.events.map((event) => (
                <span
                  key={event}
                  className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-mono"
                >
                  {event}
                </span>
              ))}
            </div>
          </div>

          {webhook.lastStatus && (
            <div>
              <div className="text-sm font-medium mb-2">Last Response</div>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${webhook.lastStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}
                >
                  {webhook.lastStatus.statusCode}
                </span>
                {webhook.lastStatus.error && (
                  <span className="text-red-600">{webhook.lastStatus.error}</span>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}

      <CreateWebhookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateWebhook}
      />
    </div>
  );
}

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    url: string,
    events: WebhookEvent[],
    maxRetries: number,
    retryDelay: number
  ) => void;
}

function CreateWebhookModal({ isOpen, onClose, onCreate }: CreateWebhookModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(60);

  const allEvents: { id: WebhookEvent; label: string; description: string }[] = [
    { id: 'learner.created', label: 'Learner Created', description: 'When a new learner is added' },
    { id: 'learner.updated', label: 'Learner Updated', description: 'When learner info changes' },
    { id: 'progress.updated', label: 'Progress Updated', description: 'When progress is recorded' },
    {
      id: 'iep.goal.completed',
      label: 'IEP Goal Completed',
      description: 'When an IEP goal is achieved',
    },
    {
      id: 'activity.completed',
      label: 'Activity Completed',
      description: 'When a learner completes an activity',
    },
    {
      id: 'assessment.completed',
      label: 'Assessment Completed',
      description: 'When an assessment is finished',
    },
    {
      id: 'subscription.created',
      label: 'Subscription Created',
      description: 'When a subscription starts',
    },
    {
      id: 'subscription.updated',
      label: 'Subscription Updated',
      description: 'When a subscription changes',
    },
    {
      id: 'subscription.cancelled',
      label: 'Subscription Cancelled',
      description: 'When a subscription ends',
    },
    { id: 'payment.succeeded', label: 'Payment Succeeded', description: 'When payment succeeds' },
    { id: 'payment.failed', label: 'Payment Failed', description: 'When payment fails' },
  ];

  const handleSubmit = () => {
    if (!name || !url || selectedEvents.length === 0) {
      alert('Please provide a name, URL, and select at least one event');
      return;
    }

    if (!url.startsWith('https://')) {
      alert('Webhook URL must use HTTPS');
      return;
    }

    onCreate(name, url, selectedEvents, maxRetries, retryDelay);
    setName('');
    setUrl('');
    setSelectedEvents([]);
    setMaxRetries(3);
    setRetryDelay(60);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Webhook" size="large">
      <div className="space-y-4">
        <Input
          label="Webhook Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Progress Sync"
          required
        />

        <Input
          label="Webhook URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/webhooks/aivo"
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Events to Subscribe</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allEvents.map((event) => (
              <label
                key={event.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition
                  ${selectedEvents.includes(event.id) ? 'border-purple-500 bg-purple-50' : 'border-neutral-200'}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEvents([...selectedEvents, event.id]);
                    } else {
                      setSelectedEvents(selectedEvents.filter((ev) => ev !== event.id));
                    }
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">{event.label}</div>
                  <div className="text-xs text-neutral-600">{event.description}</div>
                  <div className="text-xs font-mono text-neutral-500 mt-1">{event.id}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Max Retries"
            type="number"
            value={maxRetries.toString()}
            onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
            min="0"
            max="10"
          />

          <Input
            label="Retry Delay (seconds)"
            type="number"
            value={retryDelay.toString()}
            onChange={(e) => setRetryDelay(parseInt(e.target.value) || 60)}
            min="10"
            max="300"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Webhook
          </Button>
        </div>
      </div>
    </Modal>
  );
}
