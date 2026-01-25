-- Migration: 005_rls_verification.sql
-- Description: Verification script to ensure RLS policies are consistent and correct
-- Created: 2025-01-29
-- Dependencies: 001_initial_schema.sql, 003_rls_policies.sql
-- Note: This is a verification/audit script, not a migration. Run to check RLS status.

-- ============================================
-- VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================

DO $$
DECLARE
    table_record RECORD;
    rls_enabled BOOLEAN;
    required_tables TEXT[] := ARRAY[
        'users', 'vendors', 'products', 'orders', 'order_items', 'order_intents',
        'market_days', 'market_stalls', 'vendor_portfolio_items', 'vendor_change_requests',
        'super_users', 'properties', 'events', 'businesses'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== RLS Verification Report ===';
    RAISE NOTICE '';
    
    -- Check required tables
    FOREACH table_name IN ARRAY required_tables
    LOOP
        SELECT rowsecurity INTO rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = table_name;
        
        IF rls_enabled THEN
            RAISE NOTICE '✓ % - RLS ENABLED', table_name;
        ELSE
            RAISE WARNING '✗ % - RLS DISABLED (SECURITY RISK!)', table_name;
        END IF;
    END LOOP;
    
    -- Check any other tables
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename != ALL(required_tables)
        ORDER BY tablename
    LOOP
        SELECT rowsecurity INTO rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = table_record.tablename;
        
        IF rls_enabled THEN
            RAISE NOTICE '✓ % - RLS ENABLED', table_record.tablename;
        ELSE
            RAISE WARNING '✗ % - RLS DISABLED (SECURITY RISK!)', table_record.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ============================================
-- VERIFY POLICIES EXIST FOR ALL TABLES
-- ============================================

DO $$
DECLARE
    table_record RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== Policy Count Verification ===';
    RAISE NOTICE '';
    
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
        ORDER BY tablename
    LOOP
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = table_record.tablename;
        
        IF policy_count > 0 THEN
            RAISE NOTICE '✓ % - % policies', table_record.tablename, policy_count;
        ELSE
            RAISE WARNING '✗ % - NO POLICIES (SECURITY RISK!)', table_record.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ============================================
-- LIST ALL POLICIES BY TABLE
-- ============================================

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- VERIFY ADMIN FUNCTIONS EXIST
-- ============================================

DO $$
DECLARE
    func_name TEXT;
    func_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== Required Functions Verification ===';
    RAISE NOTICE '';
    
    FOR func_name IN 
        SELECT unnest(ARRAY[
            'is_admin',
            'is_vendor',
            'current_user_id',
            'generate_order_number',
            'apply_vendor_change_request'
        ])
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = func_name
        ) INTO func_exists;
        
        IF func_exists THEN
            RAISE NOTICE '✓ %() - EXISTS', func_name;
        ELSE
            RAISE WARNING '✗ %() - MISSING', func_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=== Verification Complete ===';
    RAISE NOTICE 'Review the output above for any warnings or errors.';
    RAISE NOTICE 'All tables should have RLS enabled and at least one policy.';
END $$;

