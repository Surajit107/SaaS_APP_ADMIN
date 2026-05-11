import { Loader2, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type PlatformTenantDeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string | null;
  isRemoving: boolean;
  onConfirmRemove: () => void;
};

export function PlatformTenantDeleteConfirmDialog({
  open,
  onOpenChange,
  organizationName,
  isRemoving,
  onConfirmRemove,
}: PlatformTenantDeleteConfirmDialogProps) {
  const nameLabel =
    organizationName !== null && organizationName.trim().length > 0
      ? organizationName
      : 'this organization';

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent size="default">
        <AlertDialogHeader className="sm:text-left">
          <AlertDialogTitle>Schedule organization removal?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block">
              This will soft-delete{' '}
              <span className="text-foreground font-medium">&quot;{nameLabel}&quot;</span> and
              queue it for TTL purge. Active members lose access per your runbooks; billing may
              still need a separate step.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={isRemoving} type="button">
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={isRemoving}
            onClick={() => {
              onConfirmRemove();
            }}
            type="button"
            variant="destructive"
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
            Schedule removal
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
