import { useState, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeworkService } from '@aivo/utils';
import { HomeworkSession } from '@aivo/types';
import { Button, Card, Input } from '@aivo/ui';

interface HomeworkInboxProps {
  learnerId: string;
}

export const HomeworkInbox: FC<HomeworkInboxProps> = ({ learnerId }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<HomeworkSession[]>([]);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'subject'>('recent');

  useEffect(() => {
    const allSessions = homeworkService.getAllSessions(learnerId);
    setSessions(allSessions);
  }, [learnerId]);

  const filteredSessions = sessions
    .filter((session) => {
      // Status filter
      if (filter !== 'all' && session.status !== filter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          session.title.toLowerCase().includes(query) ||
          session.detectedSubject?.toLowerCase().includes(query) ||
          session.problemStatement.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'subject':
          return (a.detectedSubject || '').localeCompare(b.detectedSubject || '');
        default:
          return 0;
      }
    });

  const stats = {
    total: sessions.length,
    inProgress: sessions.filter((s) => s.status === 'in-progress').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Delete this homework session? This cannot be undone.')) {
      // In production, call API to delete
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      localStorage.setItem('homework_sessions', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6" data-testid="homework-inbox">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📚 My Homework</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {stats.inProgress > 0
              ? `${stats.inProgress} assignment${stats.inProgress !== 1 ? 's' : ''} in progress`
              : 'All caught up! Start a new assignment.'}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/homework-helper/new')}
          data-testid="new-homework"
        >
          + New Homework
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Total Sessions</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.inProgress}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">In Progress</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Completed</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Search homework..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-homework"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'in-progress' | 'completed')}
            className="px-4 py-3 border-2 rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            data-testid="filter-status"
          >
            <option value="all">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'subject')}
            className="px-4 py-3 border-2 rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            data-testid="sort-by"
          >
            <option value="recent">Most Recent</option>
            <option value="title">Title (A-Z)</option>
            <option value="subject">Subject</option>
          </select>
        </div>
      </Card>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold mb-2">No homework sessions found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : 'Start your first homework session to get help!'}
          </p>
          <Button variant="primary" onClick={() => navigate('/homework-helper/new')}>
            + Start New Homework
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <HomeworkSessionCard
              key={session.id}
              session={session}
              onOpen={() => navigate(`/homework-helper/${session.id}`)}
              onDelete={() => handleDeleteSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HomeworkSessionCard: FC<{
  session: HomeworkSession;
  onOpen: () => void;
  onDelete: () => void;
}> = ({ session, onOpen, onDelete }) => {
  const progress = (session.completedSteps.length / 4) * 100;
  const lastUpdated = new Date(session.updatedAt);
  const isRecent = Date.now() - lastUpdated.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours

  const getStatusColor = () => {
    switch (session.status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200';
      case 'abandoned':
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
    }
  };

  return (
    <div
      className="cursor-pointer hover:shadow-lg transition"
      onClick={onOpen}
      data-testid={`session-card-${session.id}`}
    >
      <Card>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate mb-1">{session.title}</h3>
            <div className="flex flex-wrap gap-2">
              {session.detectedSubject && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                  {session.detectedSubject}
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor()}`}>
                {session.status.replace('-', ' ')}
              </span>
              {isRecent && (
                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                  Recent
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 ml-2"
            data-testid="delete-session"
          >
            🗑️
          </button>
        </div>

        {/* Problem Preview */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
          {session.problemStatement}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">Progress</span>
            <span>
              {session.completedSteps.length} / 4 steps
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>Updated {lastUpdated.toLocaleDateString()}</span>
          <span>
            {session.files.length} file{session.files.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Current Step Indicator */}
        {session.status === 'in-progress' && (
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Next: {session.currentStep.charAt(0).toUpperCase() + session.currentStep.slice(1)}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
