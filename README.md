# AgileTask
4b604c34-f8cc-42dc-b0cf-399bde2964ad Backlog
ca153f67-6bae-458c-a83d-88525cc925da In prgress
d66bc184-ff8d-474d-a5d9-ee5c4c6e7da1 Review
cf645028-cf63-4cbb-a29e-b9bbb05009f7 COmpleted

/frontend
│
├── /components        # Reusable UI components
│   ├── Header.js      # Navigation bar with links to dashboard, projects, tasks, etc.
│   ├── Sidebar.js     # Sidebar for navigation (optional, if the app is more complex)
│   ├── TaskCard.js    # Task preview component to show task details in list view
│   ├── ProjectCard.js # Project preview component
│   └── Button.js      # Reusable button component for consistency
│
├── /pages             # Next.js page routes
│   ├── /api           # API routes for server-side operations
│   │   ├── auth.js    # Authentication-related API calls (sign-up, login, logout, etc.)
│   │   ├── projects.js # Project CRUD operations
│   │   └── tasks.js   # Task CRUD operations
│   ├── /auth          # Authentication-related pages (Sign up, login)
│   │   ├── login.js   # Login page
│   │   └── signup.js  # Sign up page
│   ├── /dashboard     # User dashboard
│   │   └── index.js   # Displays dashboard with user projects
│   ├── /projects      # Project management pages
│   │   ├── index.js   # List of user projects
│   │   └── [id].js    # Specific project view (details, tasks, etc.)
│   ├── /tasks         # Task management pages
│   │   └── [id].js    # Specific task details and status update
│   ├── /404.js        # Custom 404 page
│   └── /index.js      # Landing page (optional, redirects to login if not authenticated)
│
├── /public            # Static assets like images, icons, etc.
│   └── logo.png       # Logo or branding
│
├── /styles            # Global styles (CSS or SCSS)
│   ├── globals.css    # Global styles for the app
│   └── tailwind.css   # Tailwind CSS configuration (if you're using Tailwind)
│
├── /utils             # Helper utilities and functions
│   ├── auth.js        # Utility functions related to authentication (token handling, session management)
│   └── api.js         # Utility functions for calling backend APIs
│
├── /context           # Context API for global state management (optional)
│   ├── AuthContext.js # Context to manage authentication state across pages
│   └── ProjectContext.js # Context to manage project-related states
│
└── next.config.js     # Next.js configuration file

