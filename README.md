# Nicolae Blackfang Portfolio

This is the React portfolio project. The app source and website pages are grouped under `site/`, build settings are in `config/`, and Netlify's ready-to-upload website is generated in `netlify-ready/`.

## Run the website

From this project folder, run:

```sh
npm install
npm run dev
```

Open the local address printed by Vite. The admin page is at `/admin`. Use Vite for local development; `python3 -m http.server` does not compile the React files.

## Upload to Netlify

To prepare the site for a manual upload:

```sh
npm run build
```

This creates `netlify-ready/`, which contains the finished static website. Upload that folder at [Netlify Drop](https://app.netlify.com/drop), or upload the included `release/netlify-upload.zip`. The zip has `index.html` at its top level, so upload the zip itself rather than the project folder. Netlify also accepts the prebuilt output folder as a manual deploy.

The upload is a manual deploy. To update the live site later, run the build again and upload the new `netlify-ready/` folder. The included zip is a snapshot of this build; recreate it after future changes if you prefer uploading a zip.

## Project folders

```text
site/
  admin/              Admin route entry page
  assets/             Logo and visual assets
  database/           Supabase SQL setup
  public/             Favicons and Netlify route rules
  src/
    components/       Shared React components
    lib/              Supabase client and message operations
    pages/            Home, skills, Minecraft, contact and admin pages
    styles/           React-specific styles
  styles/             Shared site design system
  index.html          SPA entry page
  inspecterror.html   Standalone unavailable-page fallback
config/
  .env.example        Example Supabase settings
  vite.config.js      Build and site entry configuration
release/
  netlify-upload.zip  Built site archive for manual upload
package.json          Commands and dependencies
package-lock.json     Exact dependency versions
```

## Supabase settings

The site uses the public Supabase anon/publishable key in the browser. If your Supabase project settings differ from the defaults in `site/src/config.js`, copy `config/.env.example` to `.env.local` in the project root and set the values there. Never put a Supabase service-role key in this website.

For inbox and admin access, apply `site/database/supabase.sql` in Supabase and configure the admin account and Row Level Security policies as described in that file.
