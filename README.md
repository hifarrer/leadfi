# LeadFind - Lead Discovery Platform

LeadFind is a powerful lead discovery platform that helps you find and connect with potential customers using advanced search capabilities and the Apify leads-finder API.

## Features

- **Advanced Search**: Multi-criteria search with industry, job title, location, company size, and more
- **User Authentication**: Secure login and registration system
- **Search History**: Save and revisit your previous searches
- **Export Functionality**: Export results to CSV or JSON format
- **Modern UI**: Responsive design with Tailwind CSS
- **Real-time Results**: Live search with progress indicators
- **Filtering**: Advanced filtering options for search results

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **External API**: Apify leads-finder
- **Export**: Papa Parse for CSV generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Apify API token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leadfind
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/leadfind?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Create an Account
- Visit the signup page to create a new account
- Use your email and password to register

### 2. Search for Leads
- Use the search form to specify your criteria:
  - **Company Industry**: Select from predefined industries
  - **Company Keywords**: Add custom keywords as tags
  - **Contact Job Title**: Choose target job titles
  - **Contact Location**: Select geographic locations
  - **Email Status**: Filter by email availability
  - **Company Size**: Choose company size ranges
  - **Minimum Revenue**: Set revenue thresholds
  - **Number of Results**: Specify how many leads to fetch

### 3. View and Filter Results
- Results are displayed in a responsive grid
- Use the built-in filters to narrow down results:
  - Search by name, company, or job title
  - Filter by email availability
  - Filter by seniority level

### 4. Export Data
- Export results to CSV or JSON format
- Files are automatically downloaded with timestamps

### 5. Manage Search History
- View all your previous searches
- Revisit saved search results
- Delete old searches

## API Integration

The application integrates with the Apify leads-finder API to fetch real lead data. The API endpoint used is:
```
https://api.apify.com/v2/acts/code_crafter~leads-finder/run-sync-get-dataset-items
```

## Database Schema

### User
- id, email, password, name, createdAt

### SearchHistory
- id, userId, parameters (JSON), resultCount, createdAt

### Lead
- Comprehensive lead data including personal info, company details, contact information, and more

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   └── search-leads/
│   ├── login/
│   ├── signup/
│   ├── history/
│   └── page.tsx
├── components/
│   ├── SearchForm.tsx
│   ├── LeadCard.tsx
│   ├── LeadsGrid.tsx
│   ├── ExportButtons.tsx
│   └── SessionProvider.tsx
└── lib/
    ├── prisma.ts
    └── auth.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.