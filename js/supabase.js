import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(
  'https://yybnufouzafwmejegbni.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Ym51Zm91emFmd21lamVnYm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODQyNDcsImV4cCI6MjA5NDg2MDI0N30.GpkMY1iZ98PpHtx3_Td-rGbMz_ph4QVdpdodJ6S5m9c'
)
