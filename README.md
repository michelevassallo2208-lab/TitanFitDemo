<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aM0b0FruW1myVEJB2slfbGyRGPzwU6Cu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database (Neon Postgres)

This app now stores users, plans, and custom exercises in Postgres (Neon). Use the SQL in `db/schema.sql` to create the tables.

### Local setup
1. Create a Neon database and copy the connection string.
2. Create a `.env.local` file and set:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
   ```
3. Run the schema:
   ```
   psql "$DATABASE_URL" -f db/schema.sql
   ```
4. Start the app:
   ```
   npm run dev
   ```

### Deploy to Vercel
1. Push the repo to GitHub (or connect your repo).
2. In Vercel, create a new project from the repo.
3. In **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` → your Neon connection string.
4. Deploy. Vercel will build the Vite frontend and the `/api` serverless functions.

If you change the schema later, re-run the SQL in `db/schema.sql` against your Neon database.
