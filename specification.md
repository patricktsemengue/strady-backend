Strady Backend Specification
This document provides a complete specification for the backend services and data models for the Strady Financial Tracker application.

Part 1: Backend Features
This section outlines the features the backend will need to support, based on the application mockups and requirements.

1. Architectural Principles
Backend-Driven Logic: To ensure security and protect intellectual property, all core business logic, calculations (portfolio metrics, P&L simulations, etc.), and data processing will be executed on the backend.

Secure API: The front end will be a "thin client," interacting with the backend through a secure, well-defined API.

Limited Client-Side Responsibility: The front end's role will be focused on user interface, data presentation, and managing the user experience. The only exceptions to the backend-driven logic are the specifically noted client-side features: the "Recently Searched" cache and the global currency display conversions. This approach prevents sensitive application logic from being exposed in the browser.

2. System Configuration
Sign-up/Guest Mode Control: The application's access mode will be controlled via a server-side environment variable (e.g., SIGNUP_MODE). This allows administrators to switch between mandatory user sign-up and a guest access mode at the deployment level, rather than through the application's admin panel.

3. Portfolio Management
Base Portfolio Currency (EUR): The portfolio metrics are calculated in EUR by default. The display currency can be changed by the user on the front end (see Global Currency Display Settings).

Calculate Portfolio Metrics: The backend must compute and provide the main portfolio statistics seen at the top. For these calculations, any transactions in non-EUR currencies will be converted to EUR using the latest cached exchange rates.

Invested Cash: The total amount of money spent on current holdings.

Premium Income: The total income generated from selling options (puts/calls).

Risk Exposure: The potential maximum loss on open positions (e.g., for sold puts).

Risk Reward Ratio: A calculated ratio based on the potential profit vs. potential loss of the portfolio.

4. Portfolio Metrics Calculation Logic
This section defines the specific formulas for all financial metrics calculated by the system.

4.1. Transaction-Level Metrics
Stocks

Buy Stock:

Invested Amount = (Price × Quantity)

Potential Loss = -Invested Amount

Break-even Point = Price

Realized Income = 0

Sell Stock:

Invested Amount = 0

Potential Loss = 0

Break-even Point = Price

Realized Income = (Price × Quantity)

Options

Buy Call/Put:

Invested Amount = (Premium × Quantity × 100)

Potential Loss = -Invested Amount

Break-even Point (Call) = Strike + Premium

Break-even Point (Put) = Strike - Premium

Realized Income = 0

Sell Call/Put:

Invested Amount = 0

Premium Income = (Premium × Quantity × 100)

Potential Loss (Put) = (Strike × Quantity × 100) - Premium Income

Potential Loss (Call) = ∞ (uncovered call)

Break-even Point (Call) = Strike + Premium

Break-even Point (Put) = Strike - Premium

Realized Income = 0

4.2. Symbol-Level Metrics
Total Invested Amount = Sum of all invested amounts for that symbol

Total Premium Income = Sum of all premiums received for that symbol

Total Realized Income = Sum of all realized gains/losses for that symbol

Total Potential Loss = Sum of worst-case losses across all trades for that symbol

Portfolio Share (%) = (Total Exposure for Symbol ÷ Total Portfolio Exposure) × 100

4.3. Asset-Type Level Metrics
Stocks:

Total Invested Amount = Sum of all stock buys

Total Realized Income = Sum of all stock sells

Total Potential Loss = Sum of invested amounts

Portfolio Share (%) = (Total Stock Exposure ÷ Total Portfolio Exposure) × 100

Options Bought:

Total Invested Amount = Sum of all premiums paid

Total Potential Loss = Same as invested amount

Portfolio Share (%) = (Total Bought Option Exposure ÷ Total Portfolio Exposure) × 100

Options Sold:

Total Premium Income = Sum of all premiums received

Total Potential Loss = Sum of obligations (strike × quantity × 100) minus premium income

Portfolio Share (%) = (Total Sold Option Exposure ÷ Total Portfolio Exposure) × 100

5. Transaction Management (CRUD Operations)
The core of the application is managing transactions. The backend needs to support full CRUD (Create, Read, Update, Delete) functionality.

Create Transaction: An endpoint to add a new transaction (stock purchase, option sale, etc.) to the user's portfolio.

Read/List Transactions: An endpoint to fetch all of the user's transactions. This should support:

Pagination: To handle a large number of transactions efficiently.

Filtering: To search for transactions by stock symbol (e.g., "AAPL", "GOOG").

Update Transaction: An endpoint to modify the details of an existing transaction.

Delete Transaction: An endpoint to remove a transaction from the portfolio.

Data Synchronization and Caching:

User transactions are stored in the backend database as the single source of truth.

For performance, the front end will maintain a local cache of the user's transactions.

When a user adds, modifies, or deletes a transaction, the front end sends the request to the backend. Upon a successful response, the front end updates its local cache to reflect the change, ensuring the UI is kept in sync without a full page reload.

6. Detailed Transaction View
Expanded Data: When a user expands a transaction, the backend needs to provide additional, detailed information, including:

Calculated Profit/Loss in currency.

Specific exposure for that single transaction.

A summary text describing the position (e.g., "You have an obligation to buy...").

Historical Chart Data: This will involve providing historical price data for the underlying asset to visualize the performance of an existing transaction over time. The resulting chart must display the breakeven axis and use light-green/light-red areas to indicate profit and loss zones.

Metric Display Logic:

Intelligent Calculation: Metrics will be calculated and displayed intelligently based on the asset type and transaction direction. For example, "Invested Amount" will not be shown for a "Sell Stock" transaction, and "Premium Income" will only be shown for option-selling transactions.

Display Limit & Carousel: A maximum of 3 metrics will be displayed at a time. If more relevant metrics are available, they will be accessible through a carousel mechanism (e.g., finger sweep or navigation buttons).

7. User Authentication and Authorization
User Accounts:

Email and Password Sign-up: Users will register using an email address and a password.

Email Verification: After signing up, a verification link will be sent to the user's email. The user must click this link to activate their account and be able to log in.

Authorization: Endpoints must be protected to ensure users can only access and modify their own financial data.

Guest Mode: When enabled via server configuration, users can access parts of the application without an account. In this mode:

Guest users can use discovery and simulation features.

Data created by guests (like simulated transactions) will be stored temporarily on the client-side (e.g., localStorage) and will not be persisted in the main database.

The application will still provide options to "Sign Up / Sign In" for users who wish to save their portfolio permanently.

Mandatory Sign-up: When guest mode is disabled via server configuration, users must create an account and log in to access any application features.

8. User and Access Management (Admin)
Admin Role: The system will have a special "admin" user role with elevated privileges.

User Management: Admin users will have access to a dashboard to view and manage all registered users.

Enable/Disable Access: Admins will have the ability to enable or disable a user's access to the application. Disabled users will not be able to log in or make API requests.

9. Data Fetching (External API Integration)
Stock Data API: The backend will integrate with the specified "Stock Data API" to search for financial assets and retrieve currency exchange rates. This data is crucial for populating the discovery page, calculating portfolio metrics, and performing currency conversions. The API provides two main endpoints: /search and /rates.

Endpoint: GET /search

Purpose: To search for stock records using a query. This will power the search bar functionality in the UI.

Searchable Fields: Users can search by symbol, name, or isin.

Wildcard Support: The query allows for wildcard matching with the % character for more flexible searches.

Endpoint: GET /rates

Purpose: To retrieve the latest exchange rates for various currencies against the Euro (EUR).

Usage: This endpoint can be used in two ways:

All Rates: If no symbol parameter is provided, it returns an array of all available currency exchange rates.

Specific Rate: If a symbol parameter is provided (e.g., EUR_USD), it returns an array containing just the rate for that specific pair.

Caching: This data will be fetched, cached, and refreshed daily by the backend to perform all necessary currency conversions for portfolio metric calculations.

10. Stock Discovery and Transaction Simulation
Intelligent Search: The backend will handle the logic for the search bar. Based on the user's input, it will intelligently query the Stock Data API against the symbol, name, and isin fields to find the most relevant stock.

Detailed Stock View: Upon selecting a search result, the backend must provide all necessary data to populate the discovery page (discovery_mockup.html). This includes:

Basic info: Ticker, name, current price, and price change.

Key statistics: Market Cap, P/E Ratio, Volume, etc.

Data for the main price chart on the discovery page.

P&L Simulation Carousel: A key feature of the discovery page is a carousel for simulating potential transactions. This section will include an editable form and a P&L chart. The backend will need an endpoint that can:

Calculate P&L Data: Accept parameters for a potential transaction (e.g., buy/sell stock, quantity, option type, strike price) and calculate a series of data points representing the potential Profit and Loss (P&L) under different future stock prices.

Return P&L Data: Return this P&L data to the frontend to be visualized. The chart must clearly display the breakeven axis and use light-green and light-red areas to show potential profit and loss.

Transaction Form:

The form will allow users to edit transaction details and will display different fields based on the transaction type (e.g., a "Premium" field for options).

The form will include a button to save the simulated transaction to the user's portfolio.

Default Form Values: The form fields will have smart defaults:

Stock Price: The current price retrieved from the API.

Quantity: 100 for stocks, 1 for options.

Option Expiry Date: The last Friday of the next month.

Currency: The currency retrieved from the API. The user can change it via a floating card that displays currencies in a 6x3 grid with navigation buttons. The display order will be: EUR, USD, CHF, GBP, then alphabetically (JPY, BGN, CZK, etc.).

Disclaimer: The simulation will not include taxes or fees, and a message will inform the user to consider these costs separately.

11. Client-Side Caching & Recently Searched Stocks
Local Caching: The front-end application will store a list of recently searched and selected stocks in the user's local cache.

"Recently Searched" Display: This cached list will be used to populate a dedicated UI component, giving users quick access to stocks they have previously viewed.

Daily Cache Refresh: To ensure the data remains current, the front end will implement a mechanism to automatically refresh the cached stock details on a daily basis by re-querying the "Stock Data API" for each item in the cache.

12. Global Currency Display Settings (Client-Side)
Floating Settings Button: A persistent floating button will give users access to global currency display options.

Local Currency Selection: Users can select their preferred local currency via a floating card that displays currencies in a 6x3 grid with navigation buttons. The display order will be: EUR, USD, CHF, GBP, then alphabetically (JPY, BGN, CZK, etc.).

Portfolio Value Conversion Toggle: A switch to display the main portfolio metrics (Invested Cash, Premium Income, etc.) converted into the selected local currency.

Transaction Value Conversion Toggle: A single switch to display all individual transaction values converted into the selected local currency.

Visual Conversion Only: These conversions are performed on the client-side for display purposes only. The underlying transaction data remains stored in its original currency.

Part 2: Data Model Specification
This section outlines the suggested data models for storing user transactions, strategies, and user accounts.

User Model
This model represents a user account in the system.

Field

Type

Description

Example

Notes

_id

ObjectID

Unique identifier for the user document.

"user_12345"

Auto-generated by the database.

email

String

User's email address, used for login.

"user@example.com"

Must be unique.

password

String

User's hashed password.

"bcrypt_hash..."

Never store in plain text.

isVerified

Boolean

Flag to check if the user has verified their email.

false

Becomes true after verification.

role

Enum (String)

The user's role. See Role Enum below.

"USER"

Defaults to USER.

isActive

Boolean

Determines if the user account is active.

true

Admins can toggle this value.

createdAt

Date

Timestamp when the document was created.

(System Timestamp)

Auto-managed by the database.

updatedAt

Date

Timestamp when the document was last updated.

(System Timestamp)

Auto-managed by the database.

Main Transaction Model
Here is the proposed structure for a single transaction document. This would typically be stored in a database collection (e.g., transactions).

Field

Type

Description

Example

Notes

_id

ObjectID

Unique identifier for the transaction document.

"63a5e3f1a9b2c..."

Auto-generated by the database.

userId

ObjectID

Reference to the User who owns this transaction.

"user_12345"

Essential for authorization.

strategyId

ObjectID

Optional reference to a Strategy this transaction is part of.

"strat_def456"

Links to the Strategy collection.

assetSymbol

String

The stock ticker or symbol (e.g., AAPL, GOOGL).

"AAPL"

Required.

assetName

String

The full name of the company or asset.

"Apple Inc."

Good for display purposes.

assetISIN

String

The International Securities Identification Number.

"US0378331005"

A unique identifier for the asset.

transactionType

Enum (String)

The type of transaction that occurred. See TransactionType Enum below.

"BOUGHT_STOCK"

Required.

quantity

Number

The number of shares (for stocks) or contracts (for options).

50

Required.

price

Number

The price per share at which the stock was bought or sold.

175.50

For stocks.

currency

String (ISO 4217)

The currency of the transaction.

"USD"

Required.

transactionDate

Date

The date the transaction was executed.

2025-08-15T00:00:00.000Z

Required.

status

Enum (String)

The current status of the position. See Status Enum below.

"OPEN"

Required.

notes

String

User-defined notes or a summary for the transaction.

"Covered call sold..."

Optional. For display in expanded view.

createdAt

Date

Timestamp when the document was created.

(System Timestamp)

Auto-managed by the database.

updatedAt

Date

Timestamp when the document was last updated.

(System Timestamp)

Auto-managed by the database.





Option-Specific Fields





strikePrice

Number

The strike price of the option contract.

450

Required for options.

expiryDate

Date

The expiration date of the option contract.

2026-01-15T00:00:00.000Z

Required for options.

premium

Number

The premium received or paid per share for the option contract.

5.50

Required for options.

Strategy Model
To group multiple transactions into a single strategy (e.g., a covered call involves owning stock and selling a call), a separate Strategy collection can be used.

Field

Type

Description

Example

Notes

_id

ObjectID

Unique identifier for the strategy.

"strat_def456"

Auto-generated by the database.

userId

ObjectID

Reference to the User who owns this strategy.

"user_1235"

Essential for authorization.

name

String

A user-defined name for the strategy.

"Covered Call on MSFT"

Required.

description

String

An optional, detailed description of the strategy's goal.

"Selling monthly calls against my MSFT shares"

Optional.

transactionIds

Array<ObjectID>

An array of transaction _id's that are part of this strategy.

["txn_abc123", "txn_xyz789"]

Links transactions together.

Enums
Role (Enum)
USER

ADMIN

TransactionType (Enum)
BOUGHT_STOCK

SOLD_STOCK

BOUGHT_CALL

SOLD_CALL

BOUGHT_PUT

SOLD_PUT

Status (Enum)
OPEN (The position is still active in the portfolio)

CLOSED (The position has been manually closed, e.g., selling a stock you owned)

EXPIRED (The option contract has reached its expiry date)

ASSIGNED (The option was exercised or assigned)

Part 3: Test Plan & Feature Behavior
This section outlines the test plan for the application's features, detailing the expected behavior for each.

1. System Configuration & Access
Test Case: SIGNUP_MODE is set to signup.

Expected Behavior: A new user visiting the site is redirected to the sign-up/login page. Access to the main application is blocked until authentication is successful.

Test Case: SIGNUP_MODE is set to guest.

Expected Behavior: A new user can access the stock discovery and simulation features without needing to log in. The UI clearly shows "Sign Up" and "Login" options. Attempting to save a transaction prompts the user to create an account.

2. User Authentication & Authorization
Test Case: A new user registers an account.

Expected Behavior: A verification email is sent to the provided address. A new User document is created with isVerified: false.

Test Case: A user attempts to log in before verifying their email.

Expected Behavior: Login is denied, and a message prompts the user to check their email for the verification link.

Test Case: A user clicks the verification link in their email.

Expected Behavior: The user's account isVerified flag is set to true. The user can now log in successfully.

Test Case: A user logs in with correct credentials (after verification).

Expected Behavior: The user is authenticated, and a session/token is created, allowing access to the application.

Test Case: A user logs in with incorrect credentials.

Expected Behavior: Authentication fails, and an appropriate error message is displayed.

Test Case: User A (logged in) attempts to access an API endpoint for User B's data (e.g., /api/users/user-b-id/transactions).

Expected Behavior: The request is denied with a "Forbidden" (403) or "Not Found" (404) status code.

3. Admin User Management
Test Case: An admin user logs in.

Expected Behavior: The admin user has access to a user management dashboard.

Test Case: A non-admin user logs in.

Expected Behavior: The user management dashboard is not visible or accessible.

Test Case: An admin disables another user's account (isActive: false).

Expected Behavior: The disabled user can no longer log in. API requests using their previous token fail.

4. Transaction Management (CRUD) & Caching
Test Case: A user creates a new "Buy Stock" transaction.

Expected Behavior: The transaction is saved to the database. Upon success, the front-end cache is updated, and the new transaction appears in the list instantly without a page reload.

Test Case: A user updates the quantity of an existing transaction.

Expected Behavior: The transaction is updated in the database. Upon success, the front-end cache is updated, and the change is reflected in the UI immediately.

Test Case: A user deletes a transaction.

Expected Behavior: The transaction is removed from the database. Upon success, the front-end cache is updated, and the transaction disappears from the UI.

Test Case: A user filters their transaction list by the symbol "TSLA".

Expected Behavior: The list updates to show only transactions with assetSymbol: "TSLA".

5. Portfolio & Metric Calculations
Test Case: Create a "Sell Put" transaction for 1 contract, strike 100, premium 5, in USD.

Expected Behavior: The portfolio metrics update correctly. Premium Income increases by 500 USD (converted to EUR). Risk Exposure increases by (100 * 100) - 500 = 9500 USD (converted to EUR).

Test Case: Create multiple transactions in USD and JPY.

Expected Behavior: All top-level portfolio metrics are displayed in EUR, with the backend performing the currency conversion correctly based on the latest cached rates.

6. Stock Discovery & P&L Simulation
Test Case: User searches for "Microsoft".

Expected Behavior: The backend correctly calls the external API, and the discovery page populates with data for MSFT.

Test Case: On the MSFT discovery page, the user simulates buying a call option.

Expected Behavior: The P&L chart displays the characteristic "hockey stick" profit graph for a long call. The breakeven point is correctly marked, and profit/loss zones are shaded.

Test Case: The user changes the simulation to a "Sold Put".

Expected Behavior: The chart updates instantly to show the correct P&L graph for a short put. The transaction form fields update to show relevant fields like "Premium".

Test Case: The user saves the simulated transaction.

Expected Behavior: The user is redirected to their portfolio, and the new transaction appears in their list.

7. Client-Side Features
Test Case: User opens the app for the first time and searches for "AAPL", "GOOG", and "TSLA".

Expected Behavior: The "Recently Searched" component on the main page displays these three symbols.

Test Case: The user uses the floating currency button to switch the display currency from EUR to GBP.

Expected Behavior: All currency values on the screen (portfolio metrics, transaction values) update to their GBP equivalent. This change is visual only and does not alter the stored data. The setting persists on a page refresh.