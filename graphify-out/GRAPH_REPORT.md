# Graph Report - src  (2026-04-28)

## Corpus Check
- Corpus is ~30,687 words - fits in a single context window. You may not need a graph.

## Summary
- 289 nodes · 323 edges · 32 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `markReady()` - 3 edges
2. `checkReady()` - 3 edges
3. `handleLoadedMetadata()` - 3 edges
4. `useSidebar()` - 2 edges
5. `SidebarMenuButton()` - 2 edges
6. `useCarousel()` - 2 edges
7. `CarouselNext()` - 2 edges
8. `clamp()` - 2 edges
9. `shouldIgnoreKeyboardTarget()` - 2 edges
10. `animate()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "UI Primitives (shadcn)"
Cohesion: 0.04
Nodes (0): 

### Community 1 - "App Shell & Routing"
Cohesion: 0.06
Nodes (0): 

### Community 2 - "Sheet Overlay"
Cohesion: 0.09
Nodes (2): SidebarMenuButton(), useSidebar()

### Community 3 - "Dialog & Button Actions"
Cohesion: 0.1
Nodes (2): CarouselNext(), useCarousel()

### Community 4 - "Form Controls"
Cohesion: 0.12
Nodes (0): 

### Community 5 - "Video Scroll Hero"
Cohesion: 0.22
Nodes (7): animate(), checkReady(), clamp(), handleKeyDown(), handleLoadedMetadata(), markReady(), shouldIgnoreKeyboardTarget()

### Community 6 - "Frame Sequence Hero"
Cohesion: 0.2
Nodes (2): handleKeyDown(), shouldIgnoreKeyboardTarget()

### Community 7 - "Command Palette"
Cohesion: 0.2
Nodes (0): 

### Community 8 - "Select Input"
Cohesion: 0.2
Nodes (0): 

### Community 9 - "Drawer Component"
Cohesion: 0.22
Nodes (0): 

### Community 10 - "Menubar Navigation"
Cohesion: 0.22
Nodes (0): 

### Community 11 - "Breadcrumb Navigation"
Cohesion: 0.29
Nodes (0): 

### Community 12 - "Legacy Mixer Hero"
Cohesion: 0.4
Nodes (2): animate(), drawFrame()

### Community 13 - "Navigation Menu"
Cohesion: 0.4
Nodes (0): 

### Community 14 - "Table Component"
Cohesion: 0.4
Nodes (0): 

### Community 15 - "Context Menu"
Cohesion: 0.4
Nodes (0): 

### Community 16 - "Tabs Component"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Card Component"
Cohesion: 0.5
Nodes (0): 

### Community 18 - "OTP Input"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Avatar Component"
Cohesion: 0.5
Nodes (0): 

### Community 20 - "Dropdown Menu"
Cohesion: 0.5
Nodes (0): 

### Community 21 - "3D Truck Hero (Three.js)"
Cohesion: 0.67
Nodes (0): 

### Community 22 - "Aspect Ratio"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Collapsible"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Sidebar Menu"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Rubik Cube 3D"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Concrete Cube 3D"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Motion Preference Hook"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Toast Notifications"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "CSS Mixer Hero"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Concrete Logo"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Aspect Ratio`** (2 nodes): `aspect-ratio.tsx`, `AspectRatio()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Collapsible`** (2 nodes): `collapsible.tsx`, `Collapsible()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sidebar Menu`** (2 nodes): `SidebarMenu.tsx`, `handleEsc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Rubik Cube 3D`** (2 nodes): `RubiksCube.tsx`, `RubiksCube()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Concrete Cube 3D`** (2 nodes): `ConcreteCube.tsx`, `ConcreteCube()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Motion Preference Hook`** (2 nodes): `useReducedMotion.ts`, `useReducedMotion()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Page`** (2 nodes): `Home.tsx`, `Home()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Toast Notifications`** (1 nodes): `sonner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSS Mixer Hero`** (1 nodes): `CSSMixerHero.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Concrete Logo`** (1 nodes): `ConcreteLogo.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `UI Primitives (shadcn)` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `App Shell & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Sheet Overlay` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Dialog & Button Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Form Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._