import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Search, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProgramEditDialog } from "./ProgramEditDialog";

interface Program {
  id: string;
  name: string;
  category: string;
  duration: string | null;
  difficulty: string | null;
  equipment: string | null;
  is_premium: boolean;
  is_standalone_purchase: boolean;
  price: number | null;
}

export const ProgramsManager = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, categoryFilter, difficultyFilter, equipmentFilter, accessFilter]);

  const filterPrograms = () => {
    let filtered = programs;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter);
    }

    if (equipmentFilter !== "all") {
      filtered = filtered.filter(p => p.equipment === equipmentFilter);
    }

    if (accessFilter === "free") {
      filtered = filtered.filter(p => !p.is_premium);
    } else if (accessFilter === "premium") {
      filtered = filtered.filter(p => p.is_premium);
    }

    setFilteredPrograms(filtered);
  };

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_training_programs')
        .select('id, name, category, duration, difficulty, equipment, is_premium, is_standalone_purchase, price')
        .order('serial_number');

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      // Get program details to find Stripe product ID
      const { data: program, error: fetchError } = await supabase
        .from('admin_training_programs')
        .select('stripe_product_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from Stripe first if product exists
      if (program?.stripe_product_id) {
        const { error: stripeError } = await supabase.functions.invoke('delete-stripe-product', {
          body: { productId: program.stripe_product_id }
        });

        if (stripeError) {
          console.error('Error deleting from Stripe:', stripeError);
          toast({
            title: "Warning",
            description: "Failed to delete from Stripe, but continuing with database deletion",
            variant: "default",
          });
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('admin_training_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Program deleted successfully from database and Stripe",
      });
      loadPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProgram(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    loadPrograms();
  };

  const toggleSelectAll = () => {
    if (selectedPrograms.length === filteredPrograms.length) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(filteredPrograms.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPrograms(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedPrograms.length === 0) return;
    
    if (!confirm(`Delete ${selectedPrograms.length} selected programs?`)) return;

    try {
      // Get all programs to find Stripe product IDs
      const { data: programsToDelete, error: fetchError } = await supabase
        .from('admin_training_programs')
        .select('id, stripe_product_id')
        .in('id', selectedPrograms);

      if (fetchError) throw fetchError;

      // Delete from Stripe for each program that has a product
      for (const program of programsToDelete || []) {
        if (program.stripe_product_id) {
          await supabase.functions.invoke('delete-stripe-product', {
            body: { productId: program.stripe_product_id }
          });
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('admin_training_programs')
        .delete()
        .in('id', selectedPrograms);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${selectedPrograms.length} programs from database and Stripe`,
      });
      setSelectedPrograms([]);
      loadPrograms();
    } catch (error) {
      console.error('Error deleting programs:', error);
      toast({
        title: "Error",
        description: "Failed to delete programs",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Category', 'Duration', 'Access', 'Price'].join(','),
      ...filteredPrograms.map(p => [
        p.id,
        `"${p.name}"`,
        p.category,
        p.duration || 'N/A',
        p.is_premium ? 'Premium' : 'Free',
        p.is_standalone_purchase && p.price ? `€${p.price}` : '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'programs.csv';
    a.click();
  };

  if (loading) {
    return <div className="text-center py-8">Loading programs...</div>;
  }

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Training Programs Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
                {selectedPrograms.length > 0 && ` (${selectedPrograms.length} selected)`}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Export
              </Button>
              {selectedPrograms.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs sm:text-sm">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Delete ({selectedPrograms.length})
                </Button>
              )}
              <Button onClick={handleNew} size="sm" className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="CARDIO">Cardio</SelectItem>
                <SelectItem value="FUNCTIONAL STRENGTH">Functional Strength</SelectItem>
                <SelectItem value="MUSCLE HYPERTROPHY">Muscle Hypertrophy</SelectItem>
                <SelectItem value="WEIGHT LOSS">Weight Loss</SelectItem>
                <SelectItem value="LOW BACK PAIN">Low Back Pain</SelectItem>
                <SelectItem value="MOBILITY/STABILITY">Mobility/Stability</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                <SelectItem value="Dumbbells">Dumbbells</SelectItem>
                <SelectItem value="Barbell">Barbell</SelectItem>
                <SelectItem value="Resistance Bands">Resistance Bands</SelectItem>
                <SelectItem value="Kettlebell">Kettlebell</SelectItem>
                <SelectItem value="Pull-up Bar">Pull-up Bar</SelectItem>
                <SelectItem value="Gym Equipment">Gym Equipment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPrograms.length === filteredPrograms.length && filteredPrograms.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {programs.length === 0 ? 'No programs yet. Create your first program!' : 'No programs match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPrograms.includes(program.id)}
                        onCheckedChange={() => toggleSelect(program.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.category}</TableCell>
                    <TableCell>{program.difficulty || 'N/A'}</TableCell>
                    <TableCell>{program.equipment || 'N/A'}</TableCell>
                    <TableCell>{program.duration || 'N/A'}</TableCell>
                    <TableCell>
                      {program.is_premium ? (
                        <Badge variant="secondary">Premium</Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {program.is_standalone_purchase && program.price ? (
                        <span className="text-sm font-semibold text-gold-600">€{Number(program.price).toFixed(2)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/training-program/${program.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(program.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProgramEditDialog
        program={editingProgram}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};
