declare module 'sveltefire' {
  import type { SvelteComponent } from 'svelte';
  import type { App as AppInstance } from 'firebase/app';

  export class FirebaseApp extends SvelteComponent<{
    app: AppInstance;
    firestore?: any;
  }> {}

  export class Collection<T = any> extends SvelteComponent<{
    path: string;
    log?: boolean;
  }, {}, {
    default: {
      data: T;
      loading: boolean;
      error: Error | null;
    };
  }> {}
}