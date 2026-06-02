# Senior Code Quality Audit: PeechTree (Flat 2.0 Transition)

Following the visual feedback, it is clear that the current implementation has "leaking styles"—hardcoded utility colors that were appropriate for the old Glassmorphism style but are now sabotaging the Flat 2.0 semantic system.

## 🚩 Critical Findings

### 1. Style Leakage (Contrast Failure)
Components like the `Sidebar` and `DashboardLayout` are still referencing hardcoded `text-gray-900` or `text-gray-600`. In a Flat 2.0 dark mode context, these render as "Black on Black" or "Dark Gray on Dark Gray," causing the zero-visibility issue observed in the navigation.

### 2. Scrollbar Aesthetic Mismatch
The native browser scrollbar is currently rendering as a default white/gray bar. This breaks the "Silent Luxury" and "Flat 2.0" immersion. It needs to be replaced with a customized, thin, thematic scrollbar.

### 3. Chart/Data Fragility
The `Revenue Trend` chart and other data visualizations fail to render axes or labels if data is null/zero, leading to "ghost boxes." We need better defensive rendering for empty datasets.

### 4. Over-Complexity in Page Components
Pages like `employees.tsx` and `dashboard.tsx` contain significant amounts of repeated UI logic (Dialogs, Tables, Skeletons) that should be abstracted into smaller, manageable sub-components to ensure consistency.

---

## 🛠️ Overhaul Strategy

### Phase 1: Semantic Standardisation
- Global sweep to replace `text-gray-*` and `bg-gray-*` with `text-foreground`, `text-muted-foreground`, and `bg-background`/`bg-card`.
- Fix the `Sidebar` to use `text-sidebar-foreground` with a 70% opacity for inactive items to ensure perfect legibility.

### Phase 2: Custom Scrollbar System
- Inject a global `webkit-scrollbar` styling into `index.css` to ensure all scrollable areas (Sidebar, Main Content) use a sleek, dark-slate track and a primary-accent thumb.

### Phase 3: Robust Component Architecture
- Implement a `DataChart` wrapper that handles the "Empty" state visually (showing a stylized "No data" message) rather than a broken container.
- Abstract the "Role Badge" logic into a reusable `RoleBadge` component to ensure consistent coloring across the whole app.

### Phase 4: Active State Refinement
- Update `SidebarMenuButton` to use a better "Selected" shape (rounded-lg with horizontal margins) to avoid the "giant orange block" look.

**Green light to proceed with the Overhaul?**
