const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://uxdqigowntphazccublf.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZHFpZ293bnRwaGF6Y2N1YmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MTc2NTQsImV4cCI6MjEwNjQ5MzY1NH0.vlJ4pjqyB8mww0-M95AG7sQJ7mnw8hnOPy5yVYLKjqo',
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'sajidasim506@gmail.com',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'sajidasim506@gmail.com',
  socialLinks: {
    github: 'https://github.com/NicolaeBlackfang',
    linkedin: 'https://www.linkedin.com/in/sajid-asim-8976b1417/',
    instagram: 'https://www.instagram.com/nicolae_1_blackfang/',
  },
};

export default config;
