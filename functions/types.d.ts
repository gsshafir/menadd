type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type PagesEnv = {
  ENQUIRIES?: KVNamespace;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
}) => Response | Promise<Response>;
