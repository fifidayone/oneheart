/**
 * TypeScript declarations for @sveltejs/enhanced-img with custom query parameters.
 * These wildcards allow using imagetools directives (like ?w=...&fit=...) while
 * maintaining the correct return type 'Picture'.
 */

declare module "*&enhanced" {
    import type { Picture } from 'vite-imagetools';
    const value: Picture;
    export default value;
}

declare module "*?enhanced" {
    import type { Picture } from 'vite-imagetools';
    const value: Picture;
    export default value;
}
