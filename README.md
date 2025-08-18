// =================================================================================
// PROJECT STRUCTURE
// =================================================================================

/*
.
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard Home)
│   │   ├── profile/page.tsx
│   │   ├── leave/
│   │   │   ├── page.tsx (Leave Request Form & History)
│   │   │   └── [id]/page.tsx (Leave Request Detail)
│   │   ├── overtime/
│   │   │   ├── page.tsx (Overtime Request Form & History)
│   │   │   └── [id]/page.tsx (Overtime Request Detail)
│   │   └── (admin)/
│   │       ├── hr/
│   │       │   ├── manage-requests/page.tsx
│   │       │   └── manage-users/page.tsx
│   │       └── layout.tsx (Role-based layout protection)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── password/
│   │   │   ├── forgot/route.ts
│   │   │   └── reset/route.ts
│   │   ├── leave/route.ts
│   │   ├── overtime/route.ts
│   │   └── notifications/route.ts
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   ├── auth/LoginForm.tsx
│   │   ├── auth/RegisterForm.tsx
│   │   ├── dashboard/Sidebar.tsx
│   │   ├── dashboard/Header.tsx
│   │   ├── notifications/NotificationBell.tsx
│   │   └── PDFGenerator.ts
│   ├── hooks/
│   │   └── useCurrentUser.ts
│   ├── lib/
│   │   ├── auth.ts (NextAuth config)
│   │   ├── db.ts (Prisma client instance)
│   │   ├── mail.ts (Nodemailer config)
│   │   └── utils.ts
│   ├── providers/
│   │   └── SessionProvider.tsx
│   ├── layout.tsx
│   └── page.tsx (Landing Page)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── logo.png
├── .env.example
├── next.config.mjs
├── package.json
└── tsconfig.json