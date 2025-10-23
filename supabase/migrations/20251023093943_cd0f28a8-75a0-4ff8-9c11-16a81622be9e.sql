-- Add nickname column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN nickname text;

-- Add unique constraint to ensure nicknames are unique
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_nickname_unique UNIQUE (nickname);

-- Add a check constraint to ensure nickname is between 3 and 20 characters
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_nickname_length CHECK (
  nickname IS NULL OR (char_length(nickname) >= 3 AND char_length(nickname) <= 20)
);