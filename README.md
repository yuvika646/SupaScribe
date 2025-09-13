# SupaScribe - Multi-tenant SaaS Notes Application

A modern, serverless multi-tenant Notes application built with Next.js and Supabase, featuring robust tenant isolation, subscription management, and a clean user interface.

## 🚀 Features

- **Multi-tenant Architecture**: Complete tenant isolation with secure data separation
- **Authentication & Authorization**: JWT-based auth with role-based access control (ADMIN/MEMBER)
- **Subscription Management**: FREE (3 notes limit) and PRO (unlimited) tiers
- **Notes CRUD**: Create, read, and delete notes with tenant-specific access
- **Responsive UI**: Modern design built with Tailwind CSS
- **Real-time Updates**: Instant UI updates after operations
- **Secure API**: Protected endpoints with middleware validation

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Middleware
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## 📋 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/         # Authentication endpoint
│   │   ├── health/             # Health check endpoint
│   │   ├── notes/              # Notes CRUD endpoints
│   │   ├── tenants/[slug]/upgrade/  # Tenant upgrade endpoint
│   │   └── user/profile/       # User profile endpoint
│   ├── dashboard/              # Protected dashboard page
│   ├── login/                  # Login page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects)
├── components/                 # Reusable components (extensible)
├── context/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   └── supabase.ts            # Supabase client configuration
└── middleware.ts              # JWT validation and user context
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd SupaScribe
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL script from `database-schema.sql` to create the tables and policies
4. Get your project URL and API keys from Project Settings > API

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🗄 Database Schema

The application uses the following database structure:

### Tables

- **tenants**: Stores tenant information and subscription status
- **profiles**: Links users to tenants with role assignments
- **notes**: Stores notes with tenant isolation

### Key Features

- **Row Level Security (RLS)**: Ensures complete tenant data isolation
- **Enum Types**: Type-safe roles ('ADMIN', 'MEMBER') and subscriptions ('FREE', 'PRO')
- **Foreign Key Constraints**: Maintains data integrity
- **Indexes**: Optimized for performance

## 🔐 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication

### Protected Endpoints (require JWT)
- `GET /api/user/profile` - Get current user profile
- `GET /api/notes` - List tenant's notes
- `POST /api/notes` - Create new note (subscription limits apply)
- `DELETE /api/notes/[id]` - Delete specific note
- `POST /api/tenants/[slug]/upgrade` - Upgrade tenant to PRO (ADMIN only)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Middleware Protection**: All routes protected except public endpoints
- **Tenant Isolation**: Complete data separation between tenants
- **Role-based Access**: ADMIN/MEMBER role distinctions
- **Input Validation**: Server-side validation for all inputs

## 💡 Usage Examples

### Creating Sample Data

After setting up the database, you'll need to create users and assign them to tenants. You can do this through the Supabase Auth interface or by creating a registration flow.

### Testing the Application

1. Create a user in Supabase Auth
2. Insert a tenant record and profile record linking the user to the tenant
3. Log in through the application
4. Create, view, and delete notes
5. Test subscription limits (FREE accounts limited to 3 notes)
6. Test admin upgrade functionality

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

## 🔧 Customization

The application is built with extensibility in mind:

- **Add new fields**: Extend the database schema and TypeScript types
- **Custom UI components**: Add components to the `src/components/` directory
- **Additional API endpoints**: Follow the existing pattern in `src/app/api/`
- **Enhanced features**: Add search, categories, sharing, etc.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please create an issue in the GitHub repository.