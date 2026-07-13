DROP TABLE IF EXISTS public._vault_names_debug;
CREATE TABLE public._vault_names_debug AS
SELECT name, LEFT(decrypted_secret, 6) AS prefix, LENGTH(decrypted_secret) AS len
FROM vault.decrypted_secrets;
GRANT SELECT ON public._vault_names_debug TO service_role, authenticated;