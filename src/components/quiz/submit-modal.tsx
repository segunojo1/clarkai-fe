"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface SubmitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  loading: boolean
}

export function SubmitModal({ isOpen, onClose, onSubmit, loading }: SubmitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Quiz</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit the quiz? You won't be able to change your answers after submission.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
