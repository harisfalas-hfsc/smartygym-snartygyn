-- Insert workout interactions with favorites and ratings
INSERT INTO workout_interactions (user_id, workout_id, workout_type, workout_name, is_favorite, is_completed, rating, has_viewed, created_at) VALUES
-- June 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-blast', 'cardio', 'Cardio Blast', false, false, null, true, '2024-06-02 08:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'strength-builder', 'strength', 'Strength Builder', false, false, null, true, '2024-06-05 10:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'hiit-inferno', 'metabolic', 'HIIT Inferno', false, true, null, true, '2024-06-08 14:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'core-builder', 'strength', 'Core Builder', false, true, null, true, '2024-06-12 16:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'mobility-flow', 'mobility', 'Mobility Flow', true, false, null, true, '2024-06-15 09:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'power-surge', 'strength', 'Power Surge', false, true, 5, true, '2024-06-20 11:30:00'),
-- July 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'metabolic-burn', 'metabolic', 'Metabolic Burn', false, false, null, true, '2024-07-03 08:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'explosive-engine', 'strength', 'Explosive Engine', false, true, null, true, '2024-07-07 15:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'iron-core', 'strength', 'Iron Core', true, false, null, true, '2024-07-11 10:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-engine-builder', 'cardio', 'Cardio Engine Builder', false, false, null, true, '2024-07-15 09:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'sweat-storm', 'metabolic', 'Sweat Storm', false, true, null, true, '2024-07-19 14:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'gravity-grind', 'strength', 'Gravity Grind', false, true, 4, true, '2024-07-23 11:00:00'),
-- August 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'calorie-crusher', 'metabolic', 'Calorie Crusher', false, false, null, true, '2024-08-02 08:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'bodyweight-beast', 'strength', 'Bodyweight Beast', false, true, null, true, '2024-08-06 13:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'flow-starter', 'mobility', 'Flow Starter', false, false, null, true, '2024-08-10 09:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'metabo-surge', 'metabolic', 'Metabo Surge', false, true, null, true, '2024-08-14 15:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'iron-titan-strength', 'strength', 'Iron Titan Strength', false, true, 5, true, '2024-08-18 10:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'challenge-circuit-pro', 'challenge', 'Challenge Circuit Pro', false, false, null, true, '2024-08-22 11:00:00'),
-- September 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-inferno', 'cardio', 'Cardio Inferno', false, true, null, true, '2024-09-03 14:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'mobility-reset', 'mobility', 'Mobility Reset', false, false, null, true, '2024-09-07 09:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'power-foundation', 'strength', 'Power Foundation', false, false, null, true, '2024-09-11 10:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'burnout-challenge', 'challenge', 'Burnout Challenge', false, true, null, true, '2024-09-15 15:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'stability-circuit', 'mobility', 'Stability Circuit', false, true, 4, true, '2024-09-19 11:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'warrior-flow', 'mobility', 'Warrior Flow', true, false, null, true, '2024-09-23 09:00:00'),
-- October 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'body-blast', 'strength', 'Body Blast', false, false, null, true, '2024-10-02 08:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'core-stability-builder', 'strength', 'Core Stability Builder', false, true, null, true, '2024-10-06 14:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-max', 'cardio', 'Cardio Max', false, false, null, true, '2024-10-10 10:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'explosive-power', 'strength', 'Explosive Power', false, true, null, true, '2024-10-14 15:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'metabo-flow', 'metabolic', 'Metabo Flow', false, true, 5, true, '2024-10-18 11:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'iron-circuit', 'strength', 'Iron Circuit', false, false, null, true, '2024-10-22 09:30:00'),
-- November 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'final-form', 'challenge', 'Final Form', false, false, null, true, '2024-11-03 08:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'spartan-endurance', 'challenge', 'Spartan Endurance Test', false, true, null, true, '2024-11-07 14:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'balance-forge', 'mobility', 'Balance Forge', false, false, null, true, '2024-11-11 10:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'burnstorm', 'metabolic', 'Burnstorm', false, true, null, true, '2024-11-15 15:00:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'pulse-igniter', 'cardio', 'Pulse Igniter', false, true, 4, true, '2024-11-19 11:30:00'),
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'mobility-wave', 'mobility', 'Mobility Wave', true, false, null, true, '2024-11-23 09:00:00');

-- Insert program interactions with favorites and ratings
INSERT INTO program_interactions (user_id, program_id, program_type, program_name, is_favorite, is_ongoing, is_completed, rating, has_viewed, created_at) VALUES
-- June 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'muscle-hypertrophy-program', 'muscle-hypertrophy', 'Muscle Hypertrophy Program', false, true, false, null, true, '2024-06-03 09:00:00'),
-- July 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'functional-strength-program', 'functional-strength', 'Functional Strength Program', true, false, false, 5, true, '2024-07-05 10:00:00'),
-- August 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'weight-loss-ignite-program', 'weight-loss', 'Weight Loss Ignite Program', false, false, true, 4, true, '2024-08-03 09:30:00'),
-- September 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-endurance-program', 'cardio', 'Cardio Endurance Program', false, true, false, null, true, '2024-09-02 08:30:00'),
-- October 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'mobility-master-flow-program', 'mobility', 'Mobility Master Flow Program', true, false, false, null, true, '2024-10-01 09:00:00'),
-- November 2024
('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'low-back-pain-relief-program', 'recovery', 'Low Back Pain Relief Program', false, false, false, 5, true, '2024-11-02 10:00:00');