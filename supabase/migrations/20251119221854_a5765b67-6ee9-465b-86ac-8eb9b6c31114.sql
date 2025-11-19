-- Fix RLS policies so admins can see all data while users only see their own

-- 1) PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Admins: full read/update access to all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users: can manage only their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);


-- 2) TRANSACTIONS TABLE POLICIES
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

-- Admins: can view all transactions
CREATE POLICY "Admins can view all transactions"
ON transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users: CRUD only their own transactions
CREATE POLICY "Users can create their own transactions"
ON transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON transactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);


-- 3) INVESTMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;

-- Admins: can view all investments
CREATE POLICY "Admins can view all investments"
ON investments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users: CRUD only their own investments
CREATE POLICY "Users can create their own investments"
ON investments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
ON investments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own investments"
ON investments
FOR SELECT
USING (auth.uid() = user_id);


-- 4) USER_ROLES TABLE POLICIES
DROP POLICY IF EXISTS "Admins manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Admins: full control of all roles
CREATE POLICY "Admins manage roles"
ON user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users: can only view their own roles
CREATE POLICY "Users can view their own roles"
ON user_roles
FOR SELECT
USING (auth.uid() = user_id);