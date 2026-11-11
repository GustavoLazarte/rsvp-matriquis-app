-- Actualizar RPCs para soportar organización/evento (sin romper las existentes)
-- track_open sigue funcionando por token

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation invitations%ROWTYPE;
  v_event events%ROWTYPE;
  v_result JSONB;
BEGIN
  SELECT * INTO v_invitation FROM public.invitations WHERE token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT * INTO v_event FROM public.events WHERE id = v_invitation.event_id LIMIT 1;
  v_result := jsonb_build_object(
    'invitation', row_to_json(v_invitation),
    'event', row_to_json(v_event)
  );
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(TEXT) TO anon, authenticated;
