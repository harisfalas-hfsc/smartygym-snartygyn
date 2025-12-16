import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Search, X, Loader2, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export const ExerciseDemonstrations = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter options from API
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [targetList, setTargetList] = useState<string[]>([]);

  // Selected filters
  const [bodyPart, setBodyPart] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [searchName, setSearchName] = useState('');

  // Selected exercise for detail modal
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Fetch filter lists on mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [bodyPartsRes, equipmentRes, targetRes] = await Promise.all([
          supabase.functions.invoke('fetch-exercisedb-exercises', {
            body: { endpoint: 'getBodyPartList' }
          }),
          supabase.functions.invoke('fetch-exercisedb-exercises', {
            body: { endpoint: 'getEquipmentList' }
          }),
          supabase.functions.invoke('fetch-exercisedb-exercises', {
            body: { endpoint: 'getTargetList' }
          })
        ]);

        if (bodyPartsRes.data && Array.isArray(bodyPartsRes.data)) {
          setBodyParts(bodyPartsRes.data);
        }
        if (equipmentRes.data && Array.isArray(equipmentRes.data)) {
          setEquipmentList(equipmentRes.data);
        }
        if (targetRes.data && Array.isArray(targetRes.data)) {
          setTargetList(targetRes.data);
        }
      } catch (error) {
        console.error('Error fetching filter lists:', error);
      } finally {
        setListsLoading(false);
      }
    };

    fetchLists();
  }, []);

  const handleSearch = async () => {
    if (!bodyPart && !equipment && !target && !searchName.trim()) {
      toast.error('Please select at least one filter or enter a search term');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      let endpoint = '';
      let params: any = { limit: 50 };

      // Priority: name search > bodyPart > equipment > target
      if (searchName.trim()) {
        endpoint = 'searchByName';
        params.name = searchName.trim();
      } else if (bodyPart) {
        endpoint = 'getByBodyPart';
        params.bodyPart = bodyPart;
      } else if (equipment) {
        endpoint = 'getByEquipment';
        params.equipment = equipment;
      } else if (target) {
        endpoint = 'getByTarget';
        params.target = target;
      }

      const { data, error } = await supabase.functions.invoke('fetch-exercisedb-exercises', {
        body: { endpoint, params }
      });

      if (error) throw error;

      let results = Array.isArray(data) ? data : [];

      // Apply additional filters client-side if multiple selected
      if (bodyPart && endpoint !== 'getByBodyPart') {
        results = results.filter(ex => ex.bodyPart === bodyPart);
      }
      if (equipment && endpoint !== 'getByEquipment') {
        results = results.filter(ex => ex.equipment === equipment);
      }
      if (target && endpoint !== 'getByTarget') {
        results = results.filter(ex => ex.target === target);
      }

      setExercises(results);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      toast.error('Failed to fetch exercises');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setBodyPart('');
    setEquipment('');
    setTarget('');
    setSearchName('');
    setExercises([]);
    setHasSearched(false);
  };

  const hasFilters = bodyPart || equipment || target || searchName.trim();

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <PlayCircle className="h-5 w-5 text-primary" />
            Exercise Demonstrations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search over 1300+ exercises with animated GIF demonstrations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by exercise name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={bodyPart} onValueChange={setBodyPart} disabled={listsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Body Part" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {bodyParts.map((part) => (
                  <SelectItem key={part} value={part}>
                    {capitalizeWords(part)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={equipment} onValueChange={setEquipment} disabled={listsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {equipmentList.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    {capitalizeWords(eq)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={target} onValueChange={setTarget} disabled={listsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Target Muscle" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {targetList.map((t) => (
                  <SelectItem key={t} value={t}>
                    {capitalizeWords(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading || !hasFilters}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Results */}
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && hasSearched && exercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No exercises found. Try different filters.</p>
            </div>
          )}

          {!loading && exercises.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className="cursor-pointer group rounded-lg border border-border hover:border-primary/50 overflow-hidden bg-card transition-all hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2 capitalize">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {exercise.target}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-8 text-muted-foreground">
              <PlayCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select filters or search to find exercise demonstrations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Detail Modal */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize text-xl">
                  {selectedExercise.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* GIF */}
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedExercise.gifUrl}
                    alt={selectedExercise.name}
                    className="w-full max-h-[400px] object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    Body Part: {selectedExercise.bodyPart}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    Target: {selectedExercise.target}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    Equipment: {selectedExercise.equipment}
                  </Badge>
                </div>

                {/* Secondary Muscles */}
                {selectedExercise.secondaryMuscles?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.secondaryMuscles.map((muscle, idx) => (
                        <Badge key={idx} variant="secondary" className="capitalize text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedExercise.instructions?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {selectedExercise.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
