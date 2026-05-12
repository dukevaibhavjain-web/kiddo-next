-- ================================================================
-- KIDDO NEXT — Run in Supabase SQL Editor
-- This adds the status column and admin support to existing setup
-- ================================================================

-- 1. Add status column to parents (if not already exists)
ALTER TABLE parents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. Set existing users as active (they were approved already)
UPDATE parents SET status = 'active' WHERE status IS NULL OR status = '';

-- 3. Add is_active to children if missing
ALTER TABLE children ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Update parents RLS to allow insert during signup
DROP POLICY IF EXISTS "parents_insert" ON parents;
DROP POLICY IF EXISTS "own" ON parents;
DROP POLICY IF EXISTS "own_select_update_delete" ON parents;
DROP POLICY IF EXISTS "own_select_own" ON parents;
DROP POLICY IF EXISTS "own_update" ON parents;
DROP POLICY IF EXISTS "own_delete" ON parents;
DROP POLICY IF EXISTS "parents_select_own" ON parents;
DROP POLICY IF EXISTS "parents_select_connected" ON parents;
DROP POLICY IF EXISTS "parents_update" ON parents;

CREATE POLICY "parents_insert"  ON parents FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "parents_select"  ON parents FOR SELECT USING (
  auth.uid() = id OR
  id IN (
    SELECT CASE WHEN requester_id = auth.uid() THEN receiver_id ELSE requester_id END
    FROM connections
    WHERE (requester_id = auth.uid() OR receiver_id = auth.uid()) AND status = 'accepted'
  )
);
CREATE POLICY "parents_update"  ON parents FOR UPDATE USING (auth.uid() = id);

-- 5. Make sure children policies are correct
DROP POLICY IF EXISTS "own" ON children;
DROP POLICY IF EXISTS "children_insert" ON children;
DROP POLICY IF EXISTS "children_select" ON children;
DROP POLICY IF EXISTS "children_update" ON children;
DROP POLICY IF EXISTS "children_delete" ON children;
DROP POLICY IF EXISTS "children_select_connected" ON children;

CREATE POLICY "children_insert" ON children FOR INSERT WITH CHECK (parent_id = auth.uid());
CREATE POLICY "children_select" ON children FOR SELECT USING (
  parent_id = auth.uid() OR
  parent_id IN (
    SELECT CASE WHEN requester_id = auth.uid() THEN receiver_id ELSE requester_id END
    FROM connections
    WHERE (requester_id = auth.uid() OR receiver_id = auth.uid()) AND status = 'accepted'
  )
);
CREATE POLICY "children_update" ON children FOR UPDATE USING (parent_id = auth.uid());
CREATE POLICY "children_delete" ON children FOR DELETE USING (parent_id = auth.uid());

-- 6. Fix streaks policies
DROP POLICY IF EXISTS "own" ON streaks;
DROP POLICY IF EXISTS "own_select" ON streaks;
DROP POLICY IF EXISTS "own_insert" ON streaks;
DROP POLICY IF EXISTS "own_update" ON streaks;
DROP POLICY IF EXISTS "streaks_insert" ON streaks;
DROP POLICY IF EXISTS "streaks_select_own" ON streaks;
DROP POLICY IF EXISTS "streaks_select_connected" ON streaks;
DROP POLICY IF EXISTS "streaks_update" ON streaks;
DROP POLICY IF EXISTS "connected_read" ON streaks;

CREATE POLICY "streaks_insert" ON streaks FOR INSERT WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);
CREATE POLICY "streaks_select" ON streaks FOR SELECT USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR child_id IN (
    SELECT c.id FROM children c
    JOIN connections cn ON (cn.requester_id = c.parent_id OR cn.receiver_id = c.parent_id)
    WHERE (cn.requester_id = auth.uid() OR cn.receiver_id = auth.uid()) AND cn.status = 'accepted'
  )
);
CREATE POLICY "streaks_update" ON streaks FOR UPDATE USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- 7. Fix all other table policies (clean slate)
DROP POLICY IF EXISTS "own" ON daily_plans;
DROP POLICY IF EXISTS "plans_insert" ON daily_plans;
DROP POLICY IF EXISTS "plans_select" ON daily_plans;
DROP POLICY IF EXISTS "plans_update" ON daily_plans;
DROP POLICY IF EXISTS "plans_delete" ON daily_plans;
CREATE POLICY "plans_all" ON daily_plans FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "own" ON journal_child;
DROP POLICY IF EXISTS "jc_insert" ON journal_child;
DROP POLICY IF EXISTS "jc_select" ON journal_child;
DROP POLICY IF EXISTS "jc_update" ON journal_child;
CREATE POLICY "jc_all" ON journal_child FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "own" ON journal_parent;
DROP POLICY IF EXISTS "jp_insert" ON journal_parent;
DROP POLICY IF EXISTS "jp_select" ON journal_parent;
DROP POLICY IF EXISTS "jp_update" ON journal_parent;
CREATE POLICY "jp_all" ON journal_parent FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "own" ON books;
DROP POLICY IF EXISTS "books_insert" ON books;
DROP POLICY IF EXISTS "books_select" ON books;
DROP POLICY IF EXISTS "books_update" ON books;
DROP POLICY IF EXISTS "books_delete" ON books;
CREATE POLICY "books_all" ON books FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "own" ON study_log;
DROP POLICY IF EXISTS "study_insert" ON study_log;
DROP POLICY IF EXISTS "study_select" ON study_log;
DROP POLICY IF EXISTS "study_update" ON study_log;
CREATE POLICY "study_all" ON study_log FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "own" ON connections;
DROP POLICY IF EXISTS "connections_insert" ON connections;
DROP POLICY IF EXISTS "connections_select" ON connections;
DROP POLICY IF EXISTS "connections_update" ON connections;
CREATE POLICY "connections_all" ON connections FOR ALL
  USING (requester_id = auth.uid() OR receiver_id = auth.uid())
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "own" ON referrals;
DROP POLICY IF EXISTS "referrals_insert" ON referrals;
DROP POLICY IF EXISTS "referrals_select" ON referrals;
CREATE POLICY "referrals_all" ON referrals FOR ALL
  USING (referrer_id = auth.uid() OR referred_id = auth.uid())
  WITH CHECK (referrer_id = auth.uid());

DROP POLICY IF EXISTS "own" ON badges_earned;
DROP POLICY IF EXISTS "badges_insert" ON badges_earned;
DROP POLICY IF EXISTS "badges_select" ON badges_earned;
CREATE POLICY "badges_all" ON badges_earned FOR ALL USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
) WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- DONE
SELECT 'Setup complete. All policies updated.' as result;
