import { BigButton } from './BigButton';

interface ExitConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function ExitConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  title = "Do you want to leave?",
  message = "Your progress will be saved automatically."
}: ExitConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">🚪</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-neutral-900 mb-4">
          {title}
        </h2>

        {/* Message */}
        <p className="text-xl text-center text-neutral-600 mb-8">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <BigButton
            onClick={onCancel}
            variant="success"
            className="flex-1"
          >
            Keep Playing!
          </BigButton>
          <BigButton
            onClick={onConfirm}
            variant="secondary"
            className="flex-1"
          >
            Yes, Leave
          </BigButton>
        </div>
      </div>
    </div>
  );
}
