-- Add missing INSERT policies to fix user registration flow

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to have their initial credits created during signup
CREATE POLICY "System can insert user credits" 
  ON public.user_credits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow new users to be assigned their default role during signup
CREATE POLICY "System can insert user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND role = 'user'::app_role);

-- Add missing UPDATE policy for generations to allow users to edit their content
CREATE POLICY "Users can update own generations" 
  ON public.generations 
  FOR UPDATE 
  USING (auth.uid() = user_id);