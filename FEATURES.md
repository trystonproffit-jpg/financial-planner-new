# Financial Planner Product Spec

## Product Summary

Build a web-first financial planning app that makes budgeting simpler for everyday users through a clean dashboard, persistent saved accounts, AI-assisted statement import, and a friendly chatbot that gives coaching-style financial guidance based on the user's saved data.

The first version should focus on clarity and ease of use instead of trying to be a full bank-sync platform. Users should be able to manage their budget manually, import statement data with AI help, review everything before saving, and ask natural-language questions about their finances.

## Target User

The first version is for anyone who wants to simplify the process of creating and maintaining a budget.

Key assumptions about the initial user:

- They want a clear picture of income, expenses, and spending categories.
- They may not want to connect their live bank accounts.
- They want help importing financial data without doing all the manual typing.
- They want practical budgeting advice without judgment.
- They need a simple month-to-month budgeting workflow.

## Product Principles

- Prioritize ease of use over feature overload.
- Keep the dashboard readable and useful at a glance.
- Require review before saving AI-extracted financial data.
- Support manual control even when AI suggestions exist.
- Use AI to reduce friction, not remove user trust or transparency.
- Give helpful coaching, not overly confident financial certainty.

## MVP Scope

### Included in MVP

- User account creation and login
- Persistent saved user data
- Unified transaction list with filters
- Manual income and expense entry
- Total monthly budget tracking
- Optional category-level monthly budget tracking
- Dashboard with multiple charts and summary metrics
- AI import for bank statements and credit card statements
- Review and approval workflow for imported transactions
- Editing of imported transaction details before save
- Basic duplicate detection for imported transactions
- Custom categories and category renaming
- Ability to mark transactions as recurring
- Chatbot that answers financial questions based on saved user data

### Not Included in MVP

- Live bank account connections
- Automatic syncing from financial institutions
- Investment tracking
- Debt payoff planning tools beyond chatbot guidance
- Goal tracking as a core feature
- Stored chatbot conversation history
- Stored uploaded statement files after processing
- Proactive chatbot alerts
- Chatbot actions that directly change user data

## Core MVP Features

### 1. Authentication and User Accounts

- Users must be able to create accounts and log in.
- User financial data must persist between sessions.
- Each user should have access only to their own saved data.
- The product should be designed for secure account-based storage rather than browser-only local storage.

### 2. Dashboard

The dashboard should be easy to scan and should surface the most important budget information first.

The default dashboard should show:

- Total income
- Total expenses
- Remaining monthly budget
- Top spending categories
- Monthly trend chart
- Recent transactions

The dashboard should also support:

- Category visibility through charts
- Quick understanding of budget health
- Clean layout on web, with future mobile adaptation in mind

### 3. Transactions

Transactions should exist in one unified list with filters rather than separate income and expense screens.

Users should be able to:

- Add manual income entries
- Add manual expense entries
- Edit transactions
- Delete transactions
- Filter transactions
- Mark transactions as recurring

Transaction fields should include:

- Description
- Amount
- Date
- Type
- Category
- Source
- Notes

### 4. Budgets

The budgeting model for MVP should be simple month-to-month budgeting.

Users should be able to:

- Set a total monthly budget
- Set optional category-level monthly budgets
- Track usage against both total and category budgets
- See whether they are on track or overspending

Budget creation should be manual in version one.

Future versions may include:

- AI-suggested starting budgets
- Smarter budget recommendations based on historical spending

### 5. Categories

Categories are central to the user experience and AI import workflow.

Users should be able to:

- Use default categories
- Create their own custom categories
- Rename categories
- Edit AI-suggested category assignments

The system should support clear budgeting and reporting categories such as:

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
- Other

### 6. AI Statement Import

This is a must-have feature for the app.

The MVP AI import flow should focus on:

- Bank statements
- Credit card statements

The AI import tool should:

- Accept statement content for processing
- Extract transaction line items only
- Identify likely income vs expense
- Suggest categories
- Flag likely duplicates using basic duplicate detection
- Present all extracted entries for user review before saving

Users must be able to:

- Review all extracted items
- Edit names, descriptions, categories, dates, and amounts
- Remove unwanted extracted items
- Approve items individually
- Bulk approve groups of items

Document handling rules for MVP:

- Process uploaded documents or extracted content
- Do not keep the uploaded source documents after processing
- Save only the approved transaction data and any needed import metadata

### 7. Duplicate Detection

Imported transactions should be checked for possible duplicates before save.

MVP duplicate detection should be basic and reliable rather than overly aggressive.

Recommended first-pass duplicate logic:

- Match exact or near-exact date
- Match same amount
- Match same or very similar description

The goal is to help users avoid duplicate imports without silently deleting data.

### 8. Charts and Reporting

The app should provide clear visual reporting to help users understand their spending without digging through raw tables.

MVP reporting should include:

- Income vs expense trend over time
- Spending by category
- Budget progress
- Recent transaction visibility

Reporting should help answer questions like:

- Where is my money going?
- Which categories are growing the fastest?
- Am I staying within my monthly budget?

### 9. Chatbot Assistant

This is also a must-have feature for the app.

The chatbot should be:

- Friendly
- Coaching-oriented
- Advice-only
- Data-aware
- Non-judgmental

The chatbot should only respond when the user asks. It should not proactively interrupt the user in MVP.

The chatbot should answer questions such as:

- How much did I spend this month?
- What category am I overspending in?
- How can I lower my spending?
- What did I spend on eating out last month?
- What patterns do you see in my expenses?
- Do I seem on track with my budget?
- What categories are growing too fast?
- What changes would help me save more?
- How stable does my cash flow look?

The chatbot should:

- Use saved transactions, budgets, categories, and recurring markers
- Answer across time periods such as this month, last month, last three months, and year to date
- Offer recommendations framed as guidance rather than certainty
- Be able to discuss user-provided goals conversationally, even though formal goal tracking is phase 2

The chatbot should not:

- Automatically modify saved data
- Auto-create budgets or transactions without approval
- Save chat history in MVP
- Pretend to give guaranteed financial outcomes

### 10. Data Persistence

The app must save user information.

Save in MVP:

- User account data
- Transactions
- Categories
- Budgets
- Recurring markers
- Imported transaction results
- Import metadata needed for duplicate checking

Do not save in MVP:

- Uploaded statement source files after processing
- Chatbot conversation history

## Recommended MVP Screens

The MVP should include these primary screens:

- Dashboard
- Transactions
- Import and Review
- Chat Assistant
- Budget Setup

## AI Workflow

1. User uploads a bank statement or credit card statement.
2. The system processes the file and extracts transaction line items.
3. The system suggests transaction types and categories.
4. The system checks for likely duplicates.
5. The user reviews every extracted item.
6. The user edits or removes any incorrect entries.
7. The user approves entries individually or in bulk.
8. Approved transactions are saved to the account and reflected in budgets, charts, and chatbot answers.

## Phase 2 Features

These are important, but intentionally deferred until after MVP:

- Goal tracking and goal progress
- AI-suggested budgets
- More advanced duplicate detection
- Deeper recurring transaction automation
- Investment tracking
- Debt payoff planning tools
- Proactive insights and alerts
- Stored chat history
- Mobile-first native experience

## Open Technical Decisions

- Authentication provider
- Database and ORM selection
- AI and OCR provider for statement extraction
- Storage and deletion workflow for temporary uploaded files
- Exact duplicate detection rules
- Web-to-mobile expansion strategy after MVP
