import { SetMetadata } from '@nestjs/common';

export const APP_CONTEXT_KEY = 'appContexts';

export const RequireAppContext = (...contexts: string[]) =>
  SetMetadata(APP_CONTEXT_KEY, contexts);
