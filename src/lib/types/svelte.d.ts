declare module 'svelte' {
    export interface ComponentProps {
      [key: string]: any;
    }
  
    export interface SvelteComponent {
      $$prop_def: ComponentProps;
    }
  
    export function onMount(fn: () => any): void;
  }