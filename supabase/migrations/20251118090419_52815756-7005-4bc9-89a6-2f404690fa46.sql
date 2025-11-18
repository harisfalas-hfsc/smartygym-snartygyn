-- Create storage bucket for contact attachments
insert into storage.buckets (id, name, public)
values ('contact-files', 'contact-files', true);

-- Allow authenticated users to upload contact files
create policy "Authenticated users can upload contact files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'contact-files');

-- Allow anyone to view contact files (for attachments in messages)
create policy "Anyone can view contact files"
on storage.objects for select
to public
using (bucket_id = 'contact-files');

-- Allow admins to delete contact files
create policy "Admins can delete contact files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'contact-files' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);