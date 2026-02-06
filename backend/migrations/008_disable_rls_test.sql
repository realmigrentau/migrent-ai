-- Migration: 008_disable_rls_test.sql
-- TEMPORARY: Disable RLS on profiles table to test if RLS is the issue
-- Once we confirm this works, we'll re-enable it with proper policies

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
