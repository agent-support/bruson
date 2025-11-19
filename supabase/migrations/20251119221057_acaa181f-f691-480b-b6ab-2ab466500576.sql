
-- Add email column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update existing profiles with emails from auth.users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au
    INNER JOIN profiles p ON p.user_id = au.id
  LOOP
    UPDATE profiles 
    SET email = user_record.email 
    WHERE user_id = user_record.id;
  END LOOP;
END $$;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    username, 
    full_name,
    country,
    email,
    usd_balance,
    roi_balance
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'country',
    new.email,
    0.00,
    0.00
  );
  RETURN new;
END;
$function$;
