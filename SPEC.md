# indexstep - Specification

## Concept & Vision

indexstep is a structured content management platform for multi-step visual tutorials. It enforces a clean, grid-based format ensuring maximum readability for DIY, tech, cooking, and crafting guides. The experience feels like a well-organized workshop — everything in its place, easy to follow, satisfying to complete.

## Design Language

### Aesthetic Direction
Industrial-modern with a workshop feel. Clean slate backgrounds with orange/amber accents — organized, focused, and purposeful.

### Color Palette
- **Primary (Slate):** `#1e293b` (dark slate), `#334155` (medium), `#64748b` (light)
- **Accent (Orange):** `#ff9940` (primary), `#ffad5c` (hover), `#f26d78` (error/report)
- **Background:** `#0f0f14` (dark), `#171721` (surface), `#2a2a3d` (border)
- **Text:** `#cbccc6` (primary), `#8b8e96` (secondary), `#5c6370` (muted)
- **Difficulty:** `#aad94c` (easy), `#e6c866` (medium), `#ff9940` (hard), `#f26d78` (expert+)

### Typography
- **Headings:** Inter (700, 600) — geometric, professional
- **Body:** Inter (400, 500) — clean readability
- **Mono:** JetBrains Mono — code/technical details
- **Scale:** 12/14/16/18/24/32/48px

### Motion Philosophy
- **Micro-interactions:** 150ms ease-out for hover states
- **Layout transitions:** 300ms ease-in-out for reveals
- **Progress animations:** Spring-like for checkmarks
- **Page transitions:** Subtle fade (200ms)
- **No motion for reduced-motion preference**

### Visual Assets
- **Icons:** Lucide React (consistent 24px stroke-width 1.5)
- **Images:** User-uploaded with fallback gradient placeholders
- **Decorative:** Subtle grid patterns, progress indicators, step connectors

## Layout & Structure

### Page Architecture

1. **Landing/Homepage**
   - Hero section with tagline and search (routes to `/search`)
   - Horizontal cover-image thumbnail strip (film-strip) of all tutorials
   - Sticky filter bar: category, difficulty, sort, grid/list toggle
   - Tutorial grid (responsive: 1/2/3/4 columns)

2. **Search Page (`/search`)**
   - URL-driven query + filter state (`?q=`, `?category=`, etc.)
   - Sticky search bar + sidebar filters (desktop) / drawer (mobile)
   - Grid results with pagination
   - Homepage search routes directly here

3. **Tutorial View Page**
   - Sticky sidebar (tools/materials) — desktop: left, mobile: collapsible drawer
   - Main content: sequential steps with large media containers
   - Progress tracking with checkboxes (localStorage-persisted)
   - View counter in header (👁 eye icon)
   - HowTo JSON-LD schema + OG/Twitter meta tags (server-rendered)
   - Completion celebration state
   - **Locked guides:** Steps are blurred with an unlock overlay CTA. Author always sees their own content. Purchased guides unlock fully.

4. **Tutorial Creation / Edit Wizard**
   - Multi-step form with progress indicator
   - Live preview panel
   - Drag-to-reorder steps
   - Same form is used for both creating new guides and editing existing ones (route: `/edit/[id]`)

5. **Admin Panel**
   - Sidebar navigation
   - Dashboard with stats cards
   - Data tables with actions

### Responsive Strategy
- Mobile-first approach
- Breakpoints: sm(640), md(768), lg(1024), xl(1280)
- Sidebar collapses to bottom sheet / drawer on mobile
- Step media stacks vertically on small screens

## Features & Interactions

### Authentication
- Email/password signup and login
- JWT tokens with httpOnly cookies
- Roles: `user` (default), `moderator`, `admin`
- Protected routes with middleware

### Tutorial Creation & Editing
- **Fields:** Title, Description, Category, Difficulty (1–5), Estimated Time, Cover Image
- **Guide Access:** Optional lock toggle — when enabled, the guide is private and requires purchase to view
  - Locked guides show a price (in dollars, stored as cents internally)
  - Unlocked (free) guides are accessible to everyone
  - Author can always view their own locked guides
- **Tools/Materials:** Dynamic add/remove list with quantities
- **Steps:** Add unlimited steps, each with:
  - Step number (auto, reorderable)
  - Title
  - Instruction text (markdown supported)
  - Image upload
- **Draft/Publish** toggle

### Tutorial Viewing
- **Progress Tracking:** Local storage persistence, checkbox per step
- **Sticky Sidebar:** Lists all tools/materials, stays visible while scrolling
- **Step Display:** Large image container, readable text, clear step number
- **Mobile UX:** Floating progress bar at bottom, tools drawer
- **View Counter:** Incremented server-side on page load, shown in header
- **Completion State:** Celebration banner when all steps checked

### Search & Discovery
- Full-text search on title, description
- Filter by: Category, Difficulty (1–5), Time range presets
- Sort by: Newest, Oldest, Most Popular (by viewCount)
- Category tags as pills
- Homepage search bar routes to `/search?q=`

### Admin Panel
- **Dashboard:** Total users, tutorials, images (with sparkline trends)
- **User Management:** Table with search, role toggle, ban/unban, delete
- **Content Moderation:** Tutorial list with quick actions (edit, delete)
- **System Logs:** Timestamped action log with actor/target
- **Reports:** Pending reports with review/dismiss/action states

### Guide Locking & Purchases
- **Locked Guides:** Authors can optionally lock any guide and set a price (in USD). Locked guides are visible on browse/search as cards with a lock badge and price, but show blurred/teaser content with an unlock overlay when viewed.
- **Purchase Flow:** User clicks "Unlock Now" → instant purchase (Stripe integration point — currently instant unlock for dev). Purchase is recorded in the database.
- **Library:** Purchased guides appear in the user's "Library" tab on their profile page.
- **Access Rules:** Author of a locked guide can always view it. Unlocked guides are freely accessible to everyone.
- **Data Model:** `Tutorial.locked` (Boolean, default false), `Tutorial.price` (Int, cents, default 0), `Purchase` (userId + tutorialId, unique pair)

### SEO & Google Indexing
- **JSON-LD HowTo Schema** — per tutorial page with step-by-step markup, author, total time, tools/supplies, cover image
- **Open Graph + Twitter Card** meta tags on every page
- **Sitemap** (`/sitemap.xml`) — auto-generated list of all published tutorials
- **robots.txt** — allows Googlebot, blocks `/api/` and `/admin/`
- Canonical URLs on every tutorial page

## Component Inventory

### Navigation
- **Navbar:** Logo, search, nav links, auth buttons/avatar dropdown

### Cards
- **TutorialCard:** Cover image, title, difficulty badge, time, author, steps count
- Hover: subtle lift shadow, orange border accent

### Tutorial Components
- **StepCard:** Step number badge, title, expandable content, image, checkbox
- **ToolsSidebar:** Sticky, collapsible sections, checkable items
- **ProgressBar:** Horizontal bar showing completed/total steps

### Admin Components
- **StatsCard:** Icon, label, value, trend indicator
- **DataTable:** Sortable columns, row actions dropdown, pagination
- **LogEntry:** Timestamp, actor, action, target link

## Technical Approach

### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v3
- **Database:** SQLite with Prisma ORM
- **Auth:** Custom JWT implementation with httpOnly cookies
- **File Storage:** Local `/public/uploads`
- **State:** React Context for auth, localStorage for progress tracking

### API Design

```
GET    /api/tutorials                - List tutorials (paginated, filterable by search/category/difficulty/timeMin/timeMax/sort)
GET    /api/tutorials/:id            - Get single tutorial with steps
POST   /api/tutorials                - Create tutorial (auth required)
PUT    /api/tutorials/:id            - Update tutorial (owner or admin)
DELETE /api/tutorials/:id            - Delete tutorial (owner or admin)
GET    /api/tutorials/purchase       - List user's purchased tutorials (auth), or check purchase status ?tutorialId=
POST   /api/tutorials/purchase       - Purchase/unlock a locked tutorial (auth)

POST   /api/auth/signup              - Create account
POST   /api/auth/login               - Login, returns JWT
POST   /api/auth/logout              - Clear cookie
GET    /api/auth/me                  - Get current user

POST   /api/upload                   - Upload image, returns URL
POST   /api/reports                  - Report a tutorial or user

GET    /api/admin/stats              - Dashboard stats (admin only)
GET    /api/admin/users              - List users (admin only)
PATCH  /api/admin/users/:id          - Update user role/status (admin only)
GET    /api/admin/tutorials          - List all tutorials (admin only)
DELETE /api/admin/tutorials/:id      - Force-delete tutorial (admin only)
GET    /api/admin/logs               - System logs (admin only)
```

### Data Model

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  password         String
  name             String
  role             Role      @default(USER)
  banned           Boolean   @default(false)
  profilePicture   String?
  backgroundImage  String?
  createdAt        DateTime  @default(now())
  tutorials        Tutorial[]
  purchases        Purchase[]
  logs             SystemLog[]
  reportsFiled     Report[]  @relation("Reporter")
  reportsReceived  Report[]  @relation("ReportedUser")
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

model Tutorial {
  id          String    @id @default(cuid())
  title       String
  description String
  category    String
  difficulty  Int
  timeMinutes Int
  coverImage  String?
  viewCount   Int       @default(0)
  published   Boolean   @default(false)
  locked      Boolean   @default(false)
  price       Int       @default(0) // price in cents
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  tools       Tool[]
  steps       Step[]
  reports     Report[]
  purchases   Purchase[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Purchase {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tutorialId  String
  tutorial    Tutorial @relation(fields: [tutorialId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([userId, tutorialId])
}

model Tool {
  id         String   @id @default(cuid())
  name       String
  quantity   String?
  tutorialId String
  tutorial   Tutorial @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
}

model Step {
  id         String   @id @default(cuid())
  order      Int
  title      String
  content    String
  imageUrl   String?
  tutorialId String
  tutorial   Tutorial @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
}

model SystemLog {
  id        String   @id @default(cuid())
  action    String
  target    String?
  actorId   String
  actor     User     @relation(fields: [actorId], references: [id])
  createdAt DateTime @default(now())
}

model Report {
  id             String       @id @default(cuid())
  type           ReportType
  reason         String
  status         ReportStatus @default(PENDING)
  reporterId     String
  reporter       User         @relation("Reporter", fields: [reporterId], references: [id])
  reportedUserId String?
  reportedUser   User?        @relation("ReportedUser", fields: [reportedUserId], references: [id])
  tutorialId     String?
  tutorial       Tutorial?     @relation(fields: [tutorialId], references: [id])
  adminNote      String?
  resolvedAt     DateTime?
  createdAt      DateTime     @default(now())
}

enum ReportType {
  USER
  TUTORIAL
}

enum ReportStatus {
  PENDING
  REVIEWED
  DISMISSED
  ACTIONED
}
```

### Security
- Password hashing with bcrypt (12 rounds)
- JWT in httpOnly cookies (not localStorage)
- CSRF protection via SameSite cookies
- Input sanitization on all endpoints
- Role checks on every admin route
- File upload validation (type, size limits)
