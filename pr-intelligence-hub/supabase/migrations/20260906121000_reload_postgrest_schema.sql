-- Ensure the Supabase Data API immediately recognizes the Phase 1 tables and
-- their organizations/opportunities foreign-key relationship.
notify pgrst, 'reload schema';
