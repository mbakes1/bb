# Next.js SaaS Starter Kit 2.0

A comprehensive, production-ready SaaS starter kit built with Next.js 15, featuring authentication, AI integration, and modern UI components.

## ✨ Features

### 🔐 Authentication & User Management

- **Better Auth v1.2.8** - Modern authentication system
- Google OAuth integration
- Session management with database persistence
- User profile management with image uploads
- Account linking for multiple providers

### 🎨 Modern UI/UX

- **Tailwind CSS v4** - Latest utility-first styling
- **shadcn/ui** components - Accessible, customizable
- **Radix UI** primitives - Unstyled, accessible components
- Dark/light theme support with smooth transitions
- Responsive design with mobile-first approach
- Loading skeletons and optimistic UI updates

### 🗄️ Database & Storage

- **Neon PostgreSQL** - Serverless database
- **Drizzle ORM** - Type-safe database toolkit
- **Cloudflare R2** - Scalable file storage with zero egress fees
- Database migrations with Drizzle Kit
- Drag & drop file uploads with progress tracking

### 📊 Analytics & Monitoring

- **PostHog** integration for product analytics
- User behavior tracking
- Custom event monitoring
- Error tracking and insights

### 🏛️ Tender Management System

- **High-Performance Architecture** - Server-side rendering with Neon database
- **Automated Data Sync** - Hourly cron jobs to sync tender data from OCDS API
- **Advanced Search & Filtering** - Date range filtering with validation
- **Document Management** - Tender documents with download capabilities
- **Real-time Updates** - Background sync keeps data fresh without user impact

## 🚀 Tech Stack

- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth v1.2.8

- **Storage**: Cloudflare R2
- **Analytics**: PostHog
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Protected dashboard area
│   │   ├── _components/     # Dashboard components
│   │   ├── tenders/        # Tender management system
│   │   ├── upload/         # File upload with R2
│   │   └── settings/       # User settings
│   └── api/
│       ├── cron/           # Automated sync jobs
│       └── tenders/        # Tender API endpoints
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── homepage/           # Landing page sections
├── lib/
│   ├── auth/              # Authentication config

│   └── upload-image.ts    # R2 file upload utilities
├── scripts/
│   └── sync-tenders.ts    # Manual tender sync script
└── db/
    ├── schema.ts          # Database schema (includes tender tables)
    └── drizzle.ts         # Database connection
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket for file storage
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd next-starter-2.0
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env.local` file with:

```env
# Database
DATABASE_URL="your-neon-database-url"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"



# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
R2_UPLOAD_IMAGE_ACCESS_KEY_ID="your-r2-access-key-id"
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_UPLOAD_IMAGE_BUCKET_NAME="your-r2-bucket-name"


```

4. **Database Setup**

```bash
# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit push
```

5. **Cloudflare R2 Setup**

- Create a Cloudflare account and set up R2 storage
- Create a bucket for file uploads
- Generate API tokens with R2 permissions
- Configure CORS settings for your domain

7. **Start Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🎯 Key Features Explained

### File Upload System

- **Cloudflare R2 integration** with S3-compatible API
- **Drag & drop interface** with visual feedback
- **File validation** - Type checking and size limits
- **Progress tracking** - Real-time upload progress
- **Image gallery** - View uploaded files with metadata
- **Copy URLs** - Easy sharing and integration

### Analytics & Tracking

- PostHog event tracking
- User behavior monitoring
- Custom analytics dashboard

### Tender Management Architecture

The tender system has been architected for high performance and reliability:

#### **From Proxy to Cache Architecture**

- **Before**: Real-time API calls to external OCDS API on every page load
- **After**: Pre-cached data in Neon database with background sync

#### **Key Components**

1. **Database Schema** (`db/schema.ts`)

   - `tenders` table: Core tender information with JSONB fields for flexibility
   - `tenderDocuments` table: Related documents with foreign key relationships

2. **Background Sync** (`app/api/cron/sync-tenders/route.ts`)

   - Runs hourly via Vercel Cron Jobs
   - Fetches latest data from OCDS API
   - Upserts data using Drizzle's conflict resolution

3. **Server Components** (`app/dashboard/tenders/`)

   - Direct database queries on server-side
   - Instant page loads with no client-side loading states
   - Advanced filtering and pagination

4. **Manual Sync** (`scripts/sync-tenders.ts`)
   - Initial data population script
   - Can be run manually for bulk updates

#### **Performance Benefits**

- **~10x faster page loads** - No external API dependency
- **Better reliability** - Your app stays up even if external API is down
- **Advanced querying** - Full SQL capabilities for complex filters
- **SEO friendly** - Server-rendered content

## 🔧 Customization

### Adding New Features

1. Create components in `components/`
2. Add API routes in `app/api/`
3. Update database schema in `db/schema.ts`
4. Run `npx drizzle-kit generate` and `npx drizzle-kit push`

### Styling

- Modify `app/globals.css` for global styles
- Use Tailwind classes for component styling
- Customize theme in `tailwind.config.ts`

### Authentication

- Configure providers in `lib/auth/auth.ts`
- Add new OAuth providers as needed
- Customize user profile fields in database schema

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment

```bash
npm run build
npm start
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and modern web technologies.
