# Implementation Plan - Manga Grid & Design Overhaul

The goal is to transform the standard grid into a dynamic "Living Manga" layout.

## User Review Required
> [!NOTE]
> The layout will change significantly from a uniform grid to an asymmetrical grid. This might affect how many posts are visible at once.

## Proposed Changes

### Component: CommunityPost
#### [MODIFY] [CommunityPost.tsx](file:///c:/Users/UBS/Desktop/gravity/otablog/components/CommunityPost.tsx)
- Add `variant` prop: `'featured' | 'horizontal' | 'vertical' | 'standard'`
- Updates styles based on variant:
    - 'featured': Larger text, larger image area.
    - 'horizontal': Side-by-side layout (image left, content right).
    - 'standard': Current layout.
- Add "Anime/Manga" styling:
    - Thick borders (black or neon).
    - Halftone patterns overlay (using CSS).
    - "Action Zoom" hover effect.

### Component: Community
#### [MODIFY] [Community.tsx](file:///c:/Users/UBS/Desktop/gravity/otablog/components/Community.tsx)
- Update Grid Container:
    - Use `grid-auto-flow: dense`.
    - Define a repeating pattern logic to assign `variant` to posts based on index.
    - Example Pattern (Cycle of 6):
        - 0: Featured (2x2)
        - 1: Standard
        - 2: Standard
        - 3: Standard
        - 4: Standard
        - 5: Horizontal (2x1)

### Styling Assets
- Add global CSS or Tailwind utilities for halftone patterns and comic borders if needed.

## Verification Plan
### Manual Verification
- Run `npm run dev`.
- Visit `#community` section.
- Verify the grid handles different screen sizes (fallback to single column on mobile).
- Verify hover effects and new aesthetic.
