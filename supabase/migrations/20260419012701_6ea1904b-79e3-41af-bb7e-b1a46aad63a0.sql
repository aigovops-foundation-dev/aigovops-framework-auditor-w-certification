UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE email IN ('bob.rapp@aigovops.community','ken.johnston@aigovops.community');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE email IN ('bob.rapp@aigovops.community','ken.johnston@aigovops.community')
ON CONFLICT (user_id, role) DO NOTHING;