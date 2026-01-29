# 5Sport Design System

This document outlines the design system used in the 5Sport Admin Dashboard, built with Next.js, Tailwind CSS, and shadcn/ui components.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Components](#components)
6. [Usage Guidelines](#usage-guidelines)

---

## Color Palette

The design system uses CSS custom properties (HSL format) for theming, supporting both light and dark modes.

### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `262 83% 58%` (Purple) | `263 70% 50%` | Primary actions, links, active states |
| `--primary-foreground` | `210 40% 98%` | `210 40% 98%` | Text on primary backgrounds |

### Background & Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `0 0% 100%` (White) | `222.2 84% 4.9%` | Page backgrounds |
| `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Primary text |
| `--card` | `0 0% 100%` | `222.2 84% 4.9%` | Card backgrounds |
| `--popover` | `0 0% 100%` | `222.2 84% 4.9%` | Popover/dropdown backgrounds |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--destructive` | `0 84.2% 60.2%` (Red) | `0 62.8% 30.6%` | Errors, delete actions |
| `--success` | `142 76% 36%` (Green) | `142 69% 58%` | Success states |
| `--warning` | `38 92% 50%` (Orange) | `38 92% 50%` | Warnings, caution |
| `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Subtle backgrounds |
| `--accent` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Hover states |

### UI Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--border` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Borders |
| `--input` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Input borders |
| `--ring` | `262 83% 58%` | `263 70% 50%` | Focus rings |

### CSS Usage

```css
/* Using color tokens */
.element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--border));
}
```

### Tailwind Usage

```jsx
<div className="bg-primary text-primary-foreground">
  Primary colored element
</div>

<div className="bg-destructive text-destructive-foreground">
  Destructive/Error state
</div>

<div className="bg-muted text-muted-foreground">
  Muted/Secondary content
</div>
```

---

## Typography

### Font Family

- **Primary Font**: System UI stack (`system-ui, -apple-system, sans-serif`)
- **Monospace**: System monospace for code (`ui-monospace, monospace`)

### Type Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 0.75rem (12px) | 400 | Captions, badges |
| `text-sm` | 0.875rem (14px) | 400 | Body text, labels |
| `text-base` | 1rem (16px) | 400 | Default body text |
| `text-lg` | 1.125rem (18px) | 500 | Subheadings |
| `text-xl` | 1.25rem (20px) | 600 | Section headers |
| `text-2xl` | 1.5rem (24px) | 700 | Card titles |
| `text-3xl` | 1.875rem (30px) | 700 | Page titles |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, navigation |
| `font-semibold` | 600 | Subheadings, buttons |
| `font-bold` | 700 | Headings, emphasis |

### Usage Examples

```jsx
{/* Page Title */}
<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

{/* Card Title */}
<h3 className="text-2xl font-semibold">User Statistics</h3>

{/* Body Text */}
<p className="text-sm text-muted-foreground">
  Supporting description text
</p>

{/* Label */}
<label className="text-sm font-medium">Email Address</label>
```

---

## Spacing

Based on a 4px grid system using Tailwind's spacing scale.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0px | Reset |
| `1` | 4px | Tight spacing |
| `2` | 8px | Component internal padding |
| `3` | 12px | Small gaps |
| `4` | 16px | Default padding |
| `6` | 24px | Section padding |
| `8` | 32px | Large gaps |
| `12` | 48px | Page sections |
| `16` | 64px | Major sections |

### Common Patterns

```jsx
{/* Card Padding */}
<div className="p-6">Card content</div>

{/* Form Spacing */}
<form className="space-y-4">
  <Input />
  <Input />
</form>

{/* Flex Gap */}
<div className="flex items-center gap-3">
  <Icon />
  <span>Text</span>
</div>

{/* Container */}
<div className="container py-6 lg:py-8">
  Page content
</div>
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 0.5rem (8px) | Base radius value |
| `rounded-sm` | 4px | Small elements |
| `rounded-md` | 6px | Buttons, inputs |
| `rounded-lg` | 8px | Cards, dialogs |
| `rounded-full` | 9999px | Avatars, badges |

```jsx
{/* Card */}
<Card className="rounded-lg" />

{/* Button */}
<Button className="rounded-md" />

{/* Avatar */}
<Avatar className="rounded-full" />

{/* Badge */}
<Badge className="rounded-full" />
```

---

## Components

### Button

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

Sizes: `default`, `sm`, `lg`, `icon`

```jsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>
```

### Input

```jsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="name@example.com" />
</div>
```

### Card

```jsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Card body content
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge

Variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`

```jsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Admin</Badge>
<Badge variant="secondary">User</Badge>
<Badge variant="destructive">Blocked</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="outline">Tag</Badge>
```

### Avatar

```jsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Data Table

```jsx
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

<DataTable
  columns={columns}
  data={users}
  searchKey="email"
  searchPlaceholder="Search by email..."
/>
```

### Dropdown Menu

```jsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Usage Guidelines

### Dark Mode

The design system supports dark mode through CSS custom properties. Toggle dark mode by adding the `dark` class to the `<html>` element.

```jsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

### Responsive Design

Use Tailwind's responsive prefixes:

| Prefix | Breakpoint |
|--------|------------|
| `sm:` | ≥640px |
| `md:` | ≥768px |
| `lg:` | ≥1024px |
| `xl:` | ≥1280px |
| `2xl:` | ≥1400px |

```jsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

### Accessibility

- Always use semantic HTML elements
- Include proper ARIA labels
- Ensure sufficient color contrast
- Support keyboard navigation
- Use `sr-only` class for screen reader text

```jsx
<Button>
  <Icon className="h-4 w-4" />
  <span className="sr-only">Close menu</span>
</Button>
```

### Component Composition

Use the `cn()` utility to merge class names:

```jsx
import { cn } from '@/lib/utils';

function MyComponent({ className, ...props }) {
  return (
    <div
      className={cn('base-classes', className)}
      {...props}
    />
  );
}
```

---

## File Structure

```
components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── table.tsx
│   ├── data-table.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   └── label.tsx
├── auth/                  # Authentication components
│   ├── protected-route.tsx
│   └── admin-guard.tsx
└── admin/                 # Admin-specific components
    └── users-columns.tsx

hooks/
├── use-auth.tsx          # Authentication hook
└── use-users.ts          # Users data fetching hook

lib/
├── utils/
│   └── cn.ts             # Class name utility
└── api/
    └── axiosInstance.ts  # API client

types/
└── user.ts               # TypeScript types
```

---

## Contributing

When adding new components:

1. Follow the existing component patterns
2. Use CSS custom properties for colors
3. Support both light and dark modes
4. Include proper TypeScript types
5. Add accessibility attributes
6. Document usage in this file
