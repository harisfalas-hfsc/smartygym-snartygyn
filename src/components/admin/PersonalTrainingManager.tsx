import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PersonalTrainingEditDialog } from "./PersonalTrainingEditDialog";
import { Clock, CheckCircle, Users, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const PersonalTrainingManager = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all personal training requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('personal_training_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      toast({
        title: "Error",
        description: "Failed to load personal training requests",
        variant: "destructive",
      });
    } else {
      setRequests(requestsData || []);
    }

    // Fetch all personal training programs
    const { data: programsData, error: programsError } = await supabase
      .from('personal_training_programs')
      .select('*, personal_training_requests(user_name, user_email)')
      .order('created_at', { ascending: false });

    if (programsError) {
      console.error('Error fetching programs:', programsError);
    } else {
      setPrograms(programsData || []);
    }

    setLoading(false);
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const handleCreateProgram = (request: any) => {
    setSelectedRequest(request);
    setEditingProgram(null);
    setShowProgramDialog(true);
  };

  const handleEditProgram = (program: any) => {
    setEditingProgram(program);
    setShowProgramDialog(true);
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('personal_training_requests')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      fetchData();
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inProgressRequests = requests.filter(r => r.status === 'in_progress');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personal Training Management
          </CardTitle>
          <CardDescription>
            Manage personal training requests and create custom programs for clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{inProgressRequests.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{completedRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({inProgressRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{request.user_name}</h3>
                        <p className="text-sm text-muted-foreground">{request.user_email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{request.fitness_level}</Badge>
                          <Badge variant="outline">{request.performance_type}</Badge>
                          <Badge variant="outline">{request.duration}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => handleCreateProgram(request)}>
                          Create Program
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pending requests</p>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              {inProgressRequests.map((request) => (
                <Card key={request.id} className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{request.user_name}</h3>
                        <p className="text-sm text-muted-foreground">{request.user_email}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Started: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleUpdateStatus(request.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {inProgressRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No requests in progress</p>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedRequests.map((request) => {
                const program = programs.find(p => p.request_id === request.id);
                return (
                  <Card key={request.id} className="border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{request.user_name}</h3>
                          <p className="text-sm text-muted-foreground">{request.user_email}</p>
                          {program && (
                            <p className="text-sm font-medium text-green-600 mt-2">
                              Program: {program.name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Completed: {request.completed_at ? new Date(request.completed_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewRequest(request)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Request
                          </Button>
                          {program && (
                            <Button size="sm" variant="outline" onClick={() => handleEditProgram(program)}>
                              Edit Program
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {completedRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No completed requests</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personal Training Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Name</p>
                  <p className="text-sm">{selectedRequest.user_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <p className="text-sm">{selectedRequest.user_email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Age</p>
                  <p className="text-sm">{selectedRequest.age}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Weight (kg)</p>
                  <p className="text-sm">{selectedRequest.weight}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Height (cm)</p>
                  <p className="text-sm">{selectedRequest.height}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Fitness Level</p>
                  <p className="text-sm capitalize">{selectedRequest.fitness_level}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold">Lifestyle</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRequest.lifestyle?.map((item: string) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Performance Type</p>
                <p className="text-sm">{selectedRequest.performance_type}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Specific Goal</p>
                <p className="text-sm">{selectedRequest.specific_goal}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-semibold">Duration</p>
                  <p className="text-sm">{selectedRequest.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Training Days/Week</p>
                  <p className="text-sm">{selectedRequest.training_days}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Workout Duration</p>
                  <p className="text-sm">{selectedRequest.workout_duration}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Available Equipment</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRequest.equipment?.map((item: string) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
                {selectedRequest.other_equipment && (
                  <p className="text-sm mt-2">Other: {selectedRequest.other_equipment}</p>
                )}
              </div>

              {selectedRequest.limitations && (
                <div>
                  <p className="text-sm font-semibold">Limitations/Injuries</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedRequest.limitations}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleUpdateStatus(selectedRequest.id, 'in_progress');
                        setShowRequestDetails(false);
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start Working
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleCreateProgram(selectedRequest);
                        setShowRequestDetails(false);
                      }}
                    >
                      Create Program
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Program Creation/Edit Dialog */}
      <PersonalTrainingEditDialog
        open={showProgramDialog}
        onOpenChange={setShowProgramDialog}
        request={selectedRequest}
        program={editingProgram}
        onSave={() => {
          fetchData();
          setShowProgramDialog(false);
        }}
      />
    </>
  );
};
