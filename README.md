# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

## Backend: create admin

There are two ways to create an initial admin user for the backend.

1) CLI (recommended for local dev)

- Activate the backend virtual environment and run the `create_admin.py` script:

```bash
cd backend
source venv/bin/activate
python create_admin.py --email admin@example.com --password S3cr3t
```

- Or run interactively:

```bash
cd backend
source venv/bin/activate
python create_admin.py --email admin@example.com
# you will be prompted for a password and confirmation
```

2) One-time API endpoint

- The backend exposes a one-time initialization endpoint that allows creating the first admin:

  - POST `/api/admin/init` with JSON body:

    ```json
    {"email":"admin@example.com", "password":"S3cr3t"}
    ```

  - The endpoint will return `403` once any admin exists in the database.

- Start the backend and call the endpoint (e.g., using `curl`):

```bash
curl -X POST http://localhost:8000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"S3cr3t"}'
```

Note: By default the app will attempt to use `DATABASE_URL` from `backend/.env`. If Postgres is unreachable or misconfigured the app will fall back to a local SQLite file `backend/roomdb.sqlite` for development.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
