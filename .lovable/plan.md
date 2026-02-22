

# Finish Reprocessing ALL Remaining Content

## The Problem
Only 125 of ~224 workouts were reprocessed. Zero training programs were reprocessed. The code fixes are deployed but ~99 workouts and ~28 programs still have broken formatting in the database.

## The Fix

### Step 1: Reprocess remaining workouts
Call `reprocess-wod-exercises` in batches of 15, starting from offset 125, with pauses between batches to avoid rate limits:
- Batch 1: offset 125, size 15
- Batch 2: offset 140, size 15
- Batch 3: offset 155, size 15
- Batch 4: offset 170, size 15
- Batch 5: offset 185, size 15
- Batch 6: offset 200, size 15
- Batch 7: offset 215, size 15 (final batch)

Each batch will wait 10-15 seconds before the next to stay within rate limits.

### Step 2: Reprocess all training programs
Call `reprocess-program-exercises` with no filters to process all ~28 programs at once (programs are fewer so a single call should work).

### Step 3: Verify
Query the database for a sample of workouts and programs to confirm the empty paragraph spacers between sections are present in the HTML.

## No Code Changes
No files need to be modified. All code fixes are already deployed. This is purely about executing the reprocessing calls that were left unfinished.

## What This Completes
- All ~224 workouts will have normalized HTML with proper section spacing
- All ~28 training programs will have normalized HTML with proper section spacing
- Combined with the 7 sealed write paths, no future content can be saved without normalization
