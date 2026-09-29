/*
# Fix function search_path security warning

Sets an explicit search_path on the update_updated_at trigger function
to resolve the security advisor warning about mutable search_path.
*/

ALTER FUNCTION update_updated_at() SET search_path = public;
