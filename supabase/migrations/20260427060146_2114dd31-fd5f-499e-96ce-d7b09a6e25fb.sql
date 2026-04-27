DO $$
BEGIN
  BEGIN
    INSERT INTO public.admin_workouts (
      id, name, type, category, equipment, is_workout_of_day, is_standalone_purchase, price, stripe_product_id, stripe_price_id
    ) VALUES (
      'validation-test-axial-current-matrix', 'Axial Current Matrix', 'WOD', 'CHALLENGE', 'BODYWEIGHT', true, true, 3.99, 'prod_test_validation', 'price_test_validation'
    );
    RAISE EXCEPTION 'Validation failed: Axial Current Matrix was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM NOT LIKE '%AI/debug-style terminology%' THEN
        RAISE;
      END IF;
  END;
END;
$$;