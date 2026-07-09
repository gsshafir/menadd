type KVNamespace = {
  put(key: string, value: string): Promise<void>;
};

type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
}) => Response | Promise<Response>;
