import { t } from "@/lib/i18n";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserPlus, User2, Shield, Users, Mail, Phone, AlertCircle, Loader2, CheckCircle, XCircle, Edit, Clock } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface DisputeParty {
  id: number;
  disputeId: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userId?: number;
  status: string;
  invitationCode: string;
  verified: boolean;
  verificationStatus: string;
  contactAddress?: string;
  createdAt: string;
  updatedAt?: string;
  lastActiveAt?: string;
}

const partyFormSchema = z.object({
  name: z.string().min(2, { message: t("name_too_short") }),
  email: z.string().email({ message: t("invalid_email") }),
  phone: z.string().optional(),
  role: z.string().min(1, { message: t("role_required") }),
  contactAddress: z.string().optional(),
});

type PartyFormValues = z.infer<typeof partyFormSchema>;

interface DisputePartyManagerProps {
  disputeId: number;
  currentUserId: number;
}

export default function DisputePartyManager({ disputeId, currentUserId }: DisputePartyManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddPartyDialogOpen, setIsAddPartyDialogOpen] = useState(false);
  const [isEditPartyDialogOpen, setIsEditPartyDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<DisputeParty | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  
  // Form setup for adding/editing parties
  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      contactAddress: "",
    },
  });
  
  // Reset form when dialog is opened/closed
  const resetForm = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      role: "", 
      contactAddress: "",
    });
  };
  
  // Fetch dispute parties
  const {
    data: parties = [],
    isLoading: isPartiesLoading,
    error: partiesError
  } = useQuery({
    queryKey: ['/api/disputes', disputeId, 'parties'],
    enabled: !!disputeId,
  });
  
  // Mutation to add a new party
  const addPartyMutation = useMutation({
    mutationFn: async (data: PartyFormValues) => {
      const res = await apiRequest("POST", `/api/disputes/${disputeId}/parties`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId, 'parties'] });
      toast({
        title: t("party_added"),
        description: t("party_added_successfully"),
      });
      setIsAddPartyDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t("party_error"),
        description: error.message || t("party_add_failed"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update an existing party
  const updatePartyMutation = useMutation({
    mutationFn: async ({ partyId, data }: { partyId: number, data: PartyFormValues }) => {
      const res = await apiRequest("PATCH", `/api/dispute-parties/${partyId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId, 'parties'] });
      toast({
        title: t("party_updated"),
        description: t("party_updated_successfully"),
      });
      setIsEditPartyDialogOpen(false);
      setEditingParty(null);
    },
    onError: (error) => {
      toast({
        title: t("party_update_error"),
        description: error.message || t("party_update_failed"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to remove a party
  const removePartyMutation = useMutation({
    mutationFn: async (partyId: number) => {
      const res = await apiRequest("DELETE", `/api/dispute-parties/${partyId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId, 'parties'] });
      toast({
        title: t("party_removed"),
        description: t("party_removed_successfully"),
      });
    },
    onError: (error) => {
      toast({
        title: t("party_remove_error"),
        description: error.message || t("party_remove_failed"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to resend invitation
  const resendInvitationMutation = useMutation({
    mutationFn: async (partyId: number) => {
      const res = await apiRequest("POST", `/api/dispute-parties/${partyId}/resend-invitation`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("invitation_sent"),
        description: t("invitation_sent_successfully"),
      });
    },
    onError: (error) => {
      toast({
        title: t("invitation_error"),
        description: error.message || t("invitation_send_failed"),
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission for adding new party
  const onSubmit = (values: PartyFormValues) => {
    if (editingParty) {
      updatePartyMutation.mutate({ partyId: editingParty.id, data: values });
    } else {
      addPartyMutation.mutate(values);
    }
  };
  
  // Handle opening the edit party dialog
  const openEditPartyModal = (party: DisputeParty) => {
    setEditingParty(party);
    form.reset({
      name: party.name,
      email: party.email,
      phone: party.phone || "",
      role: party.role,
      contactAddress: party.contactAddress || "",
    });
    setIsEditPartyDialogOpen(true);
  };
  
  // Function to check if party is owned by the current user
  const isPartyCurrentUser = (party: DisputeParty) => {
    return party.userId === currentUserId;
  };
  
  // Function to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'invited':
        return { variant: 'outline' as const, label: t("invited") };
      case 'active':
        return { variant: 'success' as const, label: t("active") };
      case 'declined':
        return { variant: 'destructive' as const, label: t("declined") };
      case 'pending':
        return { variant: 'secondary' as const, label: t("pending") };
      default:
        return { variant: 'outline' as const, label: status };
    }
  };
  
  // Group parties by role
  const partyRoleGroups = parties.reduce((groups: Record<string, DisputeParty[]>, party: DisputeParty) => {
    const role = party.role || 'Other';
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(party);
    return groups;
  }, {});
  
  // Get filtered parties based on the selected tab
  const filteredParties = selectedTab === "all" 
    ? parties 
    : parties.filter((party: DisputeParty) => party.role === selectedTab);
  
  // Boolean to check if we have at least one verified party
  const hasVerifiedParties = parties.some((party: DisputeParty) => party.verified);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("dispute_parties")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("dispute_parties_description")}</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddPartyDialogOpen(true);
        }}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("add_party")}
        </Button>
      </div>
      
      {isPartiesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : partiesError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {t("parties_fetch_error")}
          </AlertDescription>
        </Alert>
      ) : parties.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t("no_parties_added")}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("no_parties_description")}
            </p>
            <Button onClick={() => {
              resetForm();
              setIsAddPartyDialogOpen(true);
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("add_first_party")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Role-based tabs for filtering */}
          {Object.keys(partyRoleGroups).length > 1 && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  {t("all")}
                  <Badge variant="outline" className="ml-2">
                    {parties.length}
                  </Badge>
                </TabsTrigger>
                
                {Object.entries(partyRoleGroups).map(([role, roleParties]) => (
                  <TabsTrigger key={role} value={role}>
                    {t(role.toLowerCase()) || role}
                    <Badge variant="outline" className="ml-2">
                      {roleParties.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          
          {!hasVerifiedParties && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertTitle>{t("waiting_for_verification")}</AlertTitle>
              <AlertDescription>
                {t("verification_needed_description")}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParties.map((party: DisputeParty) => (
              <Card key={party.id} className={
                isPartyCurrentUser(party) ? "border-primary border-2" : ""
              }>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-base">{party.name}</h3>
                      {isPartyCurrentUser(party) && (
                        <Badge variant="outline" className="text-xs">
                          {t("you")}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getStatusBadge(party.status).variant}>
                      {getStatusBadge(party.status).label}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {party.role ? t(party.role.toLowerCase()) || party.role : t("other")}
                    
                    {party.verified && (
                      <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">
                        <CheckCircle className="h-2 w-2 mr-1" />
                        {t("verified")}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-3 w-3 mr-2" />
                      <span>{party.email}</span>
                    </div>
                    
                    {party.phone && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{party.phone}</span>
                      </div>
                    )}
                    
                    {party.lastActiveAt && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {t("last_active")}: {format(new Date(party.lastActiveAt), 'PPp')}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end gap-2 pt-0 pb-3">
                  {!isPartyCurrentUser(party) && party.status === 'invited' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => resendInvitationMutation.mutate(party.id)}
                      disabled={resendInvitationMutation.isPending}
                    >
                      <Mail className="h-3 w-3 mr-2" />
                      {t("resend_invitation")}
                    </Button>
                  )}
                  
                  {!isPartyCurrentUser(party) && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditPartyModal(party)}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        {t("edit")}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive" 
                        onClick={() => {
                          if (confirm(t("confirm_remove_party"))) {
                            removePartyMutation.mutate(party.id);
                          }
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-2" />
                        {t("remove")}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Add Party Dialog */}
      <Dialog open={isAddPartyDialogOpen} onOpenChange={setIsAddPartyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("add_party")}</DialogTitle>
            <DialogDescription>
              {t("add_party_description")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("full_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("name_placeholder") || "Full name of the party"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder={t("email_placeholder") || "Email address"} />
                    </FormControl>
                    <FormDescription>
                      {t("email_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone")} ({t("optional")})</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder={t("phone_placeholder") || "Phone number"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("role")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_role") || "Select a role"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Claimant">{t("claimant")}</SelectItem>
                        <SelectItem value="Respondent">{t("respondent")}</SelectItem>
                        <SelectItem value="Legal Representative">{t("legal_representative")}</SelectItem>
                        <SelectItem value="Witness">{t("witness")}</SelectItem>
                        <SelectItem value="Expert">{t("expert")}</SelectItem>
                        <SelectItem value="Mediator">{t("mediator")}</SelectItem>
                        <SelectItem value="Observer">{t("observer")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contact_address")} ({t("optional")})</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("address_placeholder") || "Contact address"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsAddPartyDialogOpen(false);
                    resetForm();
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={addPartyMutation.isPending}
                >
                  {addPartyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("adding")}
                    </>
                  ) : (
                    t("add_party")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Party Dialog */}
      <Dialog open={isEditPartyDialogOpen} onOpenChange={setIsEditPartyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit_party")}</DialogTitle>
            <DialogDescription>
              {t("edit_party_description")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("full_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("name_placeholder") || "Full name of the party"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder={t("email_placeholder") || "Email address"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone")} ({t("optional")})</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder={t("phone_placeholder") || "Phone number"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("role")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_role") || "Select a role"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Claimant">{t("claimant")}</SelectItem>
                        <SelectItem value="Respondent">{t("respondent")}</SelectItem>
                        <SelectItem value="Legal Representative">{t("legal_representative")}</SelectItem>
                        <SelectItem value="Witness">{t("witness")}</SelectItem>
                        <SelectItem value="Expert">{t("expert")}</SelectItem>
                        <SelectItem value="Mediator">{t("mediator")}</SelectItem>
                        <SelectItem value="Observer">{t("observer")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contact_address")} ({t("optional")})</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("address_placeholder") || "Contact address"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsEditPartyDialogOpen(false);
                    setEditingParty(null);
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatePartyMutation.isPending}
                >
                  {updatePartyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("updating")}
                    </>
                  ) : (
                    t("save_changes")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}