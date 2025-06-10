import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzscqrpfkmztqjbeuvuw.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6c2NxcnBma216dHFqYmV1dnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODIxNDYsImV4cCI6MjA2NTA1ODE0Nn0.tIPvkJNjDpgOxtIyQ3jWHSXwHm88h2gn5RFC0P_H_lo'; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
