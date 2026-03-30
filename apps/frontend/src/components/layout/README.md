# Shared layout components (sidebar & navbar)

These components are **shared** across user types (business, expert, and any future roles). They are not specific to the business app.

- **`Sidebar`** – Left sidebar navigation. Each user type passes its own nav items (e.g. from `config/businessNav` or `config/expertNav`).
- **`Header`** – Top navbar. Each user type passes its own labels (`userTypeLabel`, `userDisplayName`, `userSubLabel`).

**Usage**

- **Business:** `pages/business/*` use `DashboardLayout` with `businessSidebarItems` and header labels like `userTypeLabel="Business"`.
- **Expert:** `pages/expert/*` use the same `DashboardLayout` with `expertSidebarItems` and e.g. `userTypeLabel="Expert"`.
- **Other roles:** Add a new config in `config/` and pass it into `DashboardLayout`; no changes needed in the Sidebar or Header components.

The layout wrapper is **`layouts/DashboardLayout.tsx`**, which composes the sidebar and header and accepts all config as props.
