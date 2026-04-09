# Financial Planner App Core Features

## Product Goal

Build a React and Next.js based financial planning app that helps users understand, organize, and improve their financial picture with minimal friction. The app should support both hands-on budgeting and AI-assisted data entry from receipts, statements, and related financial documents.

## Core Product Principles

- Prioritize ease of use over feature overload.
- Make the most important financial signals visible at a glance.
- Reduce manual entry wherever possible.
- Let users review and correct AI-generated results before data is saved.
- Keep layouts clean, readable, and useful on both desktop and mobile.

## Primary User Jobs

- Track income and expenses in one place.
- Understand where money is going through charts, summaries, and trends.
- Import financial activity from receipts, statements, and document scans.
- Automatically categorize transactions into useful groups.
- Review financial health over time instead of only seeing isolated transactions.
- Edit, correct, and organize transactions without complexity.

## Core Features

### 1. Dashboard Overview

- Show a clean dashboard with top-level financial metrics.
- Display total income, total expenses, current balance, and savings rate.
- Highlight budget progress against a user-defined target.
- Surface key financial insights such as largest spending category or unusual expenses.
- Support responsive layouts for desktop, tablet, and mobile.

### 2. Transaction Management

- Allow users to manually add income and expense transactions.
- Support key fields:
  - Description
  - Amount
  - Date
  - Type
  - Category
  - Source or account
  - Notes
- Let users edit or delete transactions easily.
- Display transactions in a clear grid or table with strong scanability.
- Support sorting and filtering in later iterations.

### 3. Budget Planning

- Let users set a target spending budget.
- Show how much of the target budget has already been used.
- Highlight whether the user is on track, nearing limits, or over budget.
- Provide quick visual indicators for budget health.
- Prepare the system for future category-level budget targets.

### 4. Charts and Visual Reporting

- Include well-laid out charts for financial trends and category breakdowns.
- Show monthly income versus expenses over time.
- Show spending by category in a chart that is easy to read.
- Make charts readable in both light and dark themes.
- Ensure charts complement the data table instead of replacing it.

### 5. AI Receipt and Statement Intake

- Allow users to upload or paste extracted text from receipts, statements, and similar financial documents.
- Parse candidate transaction rows from imported content.
- Detect amounts, dates, merchants, and likely transaction types.
- Auto-categorize entries into groups such as:
  - Groceries
  - Eating Out
  - Housing
  - Utilities
  - Transportation
  - Healthcare
  - Entertainment
  - Shopping
  - Travel
  - Salary
  - Freelance
- Show a review step before importing parsed transactions.
- Let users remove or correct parsed entries before save.

### 6. AI Categorization and Suggestions

- Use rules and eventually model-based classification to suggest categories.
- Provide confidence indicators for AI-generated results.
- Allow users to override categories manually.
- Build toward learning from repeated corrections in later versions.
- Surface helpful suggestions rather than forcing automation.

### 7. Data Persistence

- Persist user data so it is not lost between sessions.
- Use local storage for early versions and prototypes.
- Plan for migration to database-backed persistence in a production Next.js version.
- Prepare for account-based storage in future iterations.

### 8. Usability and UX

- Keep forms simple and reduce unnecessary clicks.
- Use clear labels and readable spacing.
- Avoid cluttered dashboards.
- Make import, review, and correction flows feel safe and understandable.
- Provide empty states that teach users what to do next.
- Keep important actions visible and logically grouped.

### 9. Future Next.js and API Integration

- Migrate the current UI into a true Next.js app structure.
- Add server-side API routes for document processing and AI extraction.
- Connect to OCR or multimodal AI services for image-based receipt and statement parsing.
- Add authentication and protected user data storage.
- Support real file upload workflows instead of text-only prototypes.

## Desired AI Workflow

1. User uploads a receipt image, bank statement image, or PDF.
2. OCR or multimodal extraction reads the contents.
3. The system identifies possible transactions.
4. The system labels each item as income or expense.
5. The system suggests a category for each item.
6. The user reviews and edits results.
7. Approved transactions are added to the main ledger.

## Suggested Future Milestones

### Milestone 1

- Polished dashboard
- Manual transaction management
- Budget target tracking
- Category and monthly charts

### Milestone 2

- AI text parsing for receipts and statements
- Review and approval workflow
- Better transaction filtering and sorting

### Milestone 3

- True Next.js migration
- API-backed AI extraction
- Persistent database storage
- User authentication

### Milestone 4

- Real image and PDF upload
- OCR integration
- Personalized category learning
- Recurring income and recurring expense handling

## Open Product Decisions

- Which authentication provider to use in the production version.
- Which database to use for long-term persistence.
- Which OCR or multimodal AI provider to use for document understanding.
- Whether to support household-level shared budgets.
- Whether to include account linking to banks in a later phase.

