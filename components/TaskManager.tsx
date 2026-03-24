import type { ScheduledTask } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TaskManager({
  tasks,
  onCancel,
  onDelete,
  onBack,
}: {
  tasks: ScheduledTask[]
  onCancel: (id: string) => void
  onDelete: (id: string) => void
  onBack: () => void
}) {
  const active = tasks.filter(t => t.active)
  const inactive = tasks.filter(t => !t.active)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your scheduled news digests</p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-blue-600 border border-gray-300 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Back to Home
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">No scheduled tasks yet</p>
          <p className="text-gray-400 text-sm mt-1">Set up your preferences and add an email to create a task</p>
          <button
            onClick={onBack}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Get started →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Active ({active.length})
              </h3>
              <div className="space-y-3">
                {active.map(task => (
                  <TaskCard key={task.id} task={task} onCancel={onCancel} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}

          {inactive.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Cancelled ({inactive.length})
              </h3>
              <div className="space-y-3 opacity-60">
                {inactive.map(task => (
                  <TaskCard key={task.id} task={task} onCancel={onCancel} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TaskCard({
  task,
  onCancel,
  onDelete,
}: {
  task: ScheduledTask
  onCancel: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              task.active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {task.active ? '● Active' : '○ Cancelled'}
            </span>
            <span className="text-xs text-gray-400">Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.keywords.map(kw => (
              <span key={kw} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100">
                {kw}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">🕐</span>
              {task.pushTime} · {task.timezone}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-400">📧</span>
              {task.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {task.active && (
            <button
              onClick={() => onCancel(task.id)}
              className="text-xs text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-500 hover:text-red-600 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
