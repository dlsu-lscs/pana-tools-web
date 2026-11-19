'use client';

import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Feedback">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-white/70">
          Are you sure you want to delete this feedback entry?{' '}
          <span className="text-red-400 font-medium">This action cannot be undone.</span>
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full bg-red-600/80 hover:bg-red-600 text-white border border-red-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}