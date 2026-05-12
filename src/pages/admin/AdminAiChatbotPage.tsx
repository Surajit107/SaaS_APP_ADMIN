import { Bot, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_PLATFORM_AI_CHATBOT_STATUS } from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { PlatformAiChatbotStatusResponse } from '@/lib/api/types';

type StatusData = PlatformAiChatbotStatusResponse['data'];

export function AdminAiChatbotPage(): ReactElement {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await GET_PLATFORM_AI_CHATBOT_STATUS();
      setData(res.data.data);
    } catch (err: unknown) {
      setData(null);
      setError(getApiErrorMessage(err, 'Unable to load AI status'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary/12 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20">
            <Bot aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-foreground text-xl font-bold tracking-tight">AI assistant</h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
              Tenant users call <code className="text-foreground/90 bg-muted rounded px-1 py-0.5 text-xs">/api/chat/*</code> with a JWT. Access follows Pro / Enterprise catalog names; optional{' '}
              <code className="text-foreground/90 bg-muted rounded px-1 py-0.5 text-xs">features.aiChatbot</code> overrides are only allowed on those tiers in the plan catalog.
            </p>
          </div>
        </div>
        <Button
          disabled={isLoading}
          onClick={() => {
            void load();
          }}
          type="button"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <RefreshCw aria-hidden className="size-4" />
          )}
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {error !== null ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {isLoading && data === null ? (
        <div className="text-muted-foreground flex items-center gap-2 py-12 text-sm">
          <Loader2 aria-hidden className="size-5 animate-spin" />
          Loading…
        </div>
      ) : null}

      {data !== null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API keys (configured)</CardTitle>
              <CardDescription>Boolean flags only — never shown in the UI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="OpenRouter" ok={data.openrouterKeyConfigured} />
              <Row label="Groq" ok={data.groqKeyConfigured} />
              <Row label="Gemini" ok={data.geminiKeyConfigured} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Runtime defaults</CardTitle>
              <CardDescription>From environment; change in server `.env`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-xs leading-relaxed break-all">
              <p>
                <span className="text-muted-foreground">Order:</span> {data.providerOrder}
              </p>
              <p>
                <span className="text-muted-foreground">OpenRouter model:</span> {data.modelOpenrouter}
              </p>
              <p>
                <span className="text-muted-foreground">Groq model:</span> {data.modelGroq}
              </p>
              <p>
                <span className="text-muted-foreground">Gemini model:</span> {data.modelGemini}
              </p>
              <p>
                <span className="text-muted-foreground">Custom system prompt:</span>{' '}
                {data.systemPromptConfigured ? 'yes' : 'no (built-in default)'}
              </p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-base inline-flex items-center gap-2">
                <CreditCard aria-hidden className="size-4" />
                Plan catalog
              </CardTitle>
              <CardDescription>
                Per-plan assistant override appears only for <strong className="text-foreground">Pro</strong> and{' '}
                <strong className="text-foreground">Enterprise</strong> catalog names in{' '}
                <Link className="text-primary font-medium underline-offset-4 hover:underline" to="/admin/subscriptions">
                  Subscriptions → Plans
                </Link>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, ok }: { label: string; ok: boolean }): ReactElement {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={ok ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
        {ok ? 'Configured' : 'Missing'}
      </span>
    </div>
  );
}
