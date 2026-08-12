import { Copy, Download, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface BackupCodesPanelProps {
  codes: string[];
  /** Used in the downloaded file body so multiple accounts stay distinguishable. */
  accountEmail: string | null;
  onDone: () => void;
}

/**
 * The one and only view of a set of recovery codes — the server keeps digests,
 * so anything not saved here is gone.
 */
export function BackupCodesPanel({
  codes,
  accountEmail,
  onDone,
}: BackupCodesPanelProps) {
  const copyAll = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      toast.success('Recovery codes copied');
    } catch {
      toast.error('Could not copy — select the codes and copy them manually');
    }
  };

  const download = (): void => {
    const body = [
      'Recovery codes for two-factor authentication',
      accountEmail !== null ? `Account: ${accountEmail}` : null,
      `Generated: ${new Date().toISOString()}`,
      '',
      'Each code works once. Keep this file somewhere safe.',
      '',
      ...codes,
      '',
    ]
      .filter((line) => line !== null)
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([body], { type: 'text/plain;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'recovery-codes.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-lg border p-3">
        <TriangleAlert aria-hidden className="text-destructive mt-0.5 size-4 shrink-0" />
        <p className="text-foreground text-xs leading-snug">
          Save these now — they are shown only once. Each code signs you in once
          if you lose access to your authenticator app.
        </p>
      </div>

      <ul className="border-border bg-muted/40 grid grid-cols-2 gap-2 rounded-lg border p-3">
        {codes.map((code) => (
          <li
            className="text-foreground text-center font-mono text-xs tracking-wide"
            key={code}
          >
            {code}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            void copyAll();
          }}
          size="lg"
          type="button"
          variant="outline"
        >
          <Copy aria-hidden />
          Copy all
        </Button>
        <Button onClick={download} size="lg" type="button" variant="outline">
          <Download aria-hidden />
          Download
        </Button>
        <Button className="ml-auto" onClick={onDone} size="lg" type="button">
          I&apos;ve saved them
        </Button>
      </div>
    </div>
  );
}
