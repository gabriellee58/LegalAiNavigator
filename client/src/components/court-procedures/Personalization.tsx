import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  StickyNote, Bell, CheckSquare, Plus, Edit2, Trash2, 
  Save, Calendar, AlertCircle, Clock, CircleCheck, 
  Circle, CheckCircle, MoreVertical
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { ProcedureStep } from '@/types/court-procedures';

interface PersonalizationProps {
  procedureId: number;
  steps: ProcedureStep[];
  userProcedureId?: number;
}

interface Note {
  id: number;
  stepId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Reminder {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  notifyBefore: number; // days
  isCompleted: boolean;
  stepId?: number;
}

interface ChecklistItem {
  id: number;
  text: string;
  isCompleted: boolean;
  stepId?: number;
  category?: string;
}

export const Personalization: React.FC<PersonalizationProps> = ({
  procedureId,
  steps,
  userProcedureId
}) => {
  const [activeTab, setActiveTab] = useState<string>('notes');
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [selectedStepForNote, setSelectedStepForNote] = useState<number | null>(null);
  
  // Reminders state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTitle, setNewReminderTitle] = useState<string>('');
  const [newReminderDescription, setNewReminderDescription] = useState<string>('');
  const [newReminderDate, setNewReminderDate] = useState<Date | undefined>(undefined);
  const [newReminderDays, setNewReminderDays] = useState<number>(1);
  const [newReminderStep, setNewReminderStep] = useState<number | undefined>(undefined);
  
  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('general');
  const [newItemStep, setNewItemStep] = useState<number | undefined>(undefined);
  
  // Add new note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteObj: Note = {
      id: Date.now(), // Temporary ID, would be replaced by server
      stepId: selectedStepForNote || 0,
      content: newNote,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setNotes([...notes, newNoteObj]);
    setNewNote('');
    setSelectedStepForNote(null);
    
    toast({
      title: "Note Added",
      description: "Your note has been saved successfully."
    });
  };
  
  // Update existing note
  const handleUpdateNote = (noteId: number, content: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, content, updatedAt: new Date() } 
        : note
    ));
    
    setEditingNoteId(null);
    
    toast({
      title: "Note Updated",
      description: "Your note has been updated successfully."
    });
  };
  
  // Delete note
  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
    
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted."
    });
  };
  
  // Add new reminder
  const handleAddReminder = () => {
    if (!newReminderTitle.trim() || !newReminderDate) return;
    
    const newReminderObj: Reminder = {
      id: Date.now(), // Temporary ID
      title: newReminderTitle,
      description: newReminderDescription,
      dueDate: newReminderDate,
      notifyBefore: newReminderDays,
      isCompleted: false,
      stepId: newReminderStep
    };
    
    setReminders([...reminders, newReminderObj]);
    setNewReminderTitle('');
    setNewReminderDescription('');
    setNewReminderDate(undefined);
    setNewReminderDays(1);
    setNewReminderStep(undefined);
    
    toast({
      title: "Reminder Added",
      description: "Your reminder has been set successfully."
    });
  };
  
  // Toggle reminder completion
  const toggleReminderCompletion = (reminderId: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, isCompleted: !reminder.isCompleted } 
        : reminder
    ));
  };
  
  // Delete reminder
  const handleDeleteReminder = (reminderId: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
    
    toast({
      title: "Reminder Deleted",
      description: "Your reminder has been deleted."
    });
  };
  
  // Add new checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now(), // Temporary ID
      text: newChecklistItem,
      isCompleted: false,
      stepId: newItemStep,
      category: newItemCategory
    };
    
    setChecklist([...checklist, newItem]);
    setNewChecklistItem('');
    setNewItemCategory('general');
    setNewItemStep(undefined);
    
    toast({
      title: "Checklist Item Added",
      description: "Your checklist item has been added."
    });
  };
  
  // Toggle checklist item completion
  const toggleChecklistItemCompletion = (itemId: number) => {
    setChecklist(checklist.map(item => 
      item.id === itemId 
        ? { ...item, isCompleted: !item.isCompleted } 
        : item
    ));
  };
  
  // Delete checklist item
  const handleDeleteChecklistItem = (itemId: number) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
    
    toast({
      title: "Checklist Item Deleted",
      description: "Your checklist item has been removed."
    });
  };
  
  // Group checklist items by category
  const checklistByCategory = checklist.reduce<Record<string, ChecklistItem[]>>(
    (acc, item) => {
      const category = item.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, 
    {}
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          Personalization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="notes" className="flex items-center gap-1">
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </TabsTrigger>
          </TabsList>
          
          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="new-note">Add a Note</Label>
                  <div className="flex gap-2 mt-1 items-start">
                    <Select 
                      value={selectedStepForNote?.toString() || ''}
                      onValueChange={(value) => setSelectedStepForNote(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="max-w-[180px]">
                        <SelectValue placeholder="Related Step (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">General Note</SelectItem>
                        {steps.map(step => (
                          <SelectItem key={step.id} value={step.id.toString()}>
                            Step {step.stepOrder}: {step.title.substring(0, 20)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-grow">
                      <Textarea 
                        id="new-note" 
                        placeholder="Enter your note here..." 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <StickyNote className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No notes yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add notes related to your procedure steps or general information.
                    </p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="p-4 border rounded-lg space-y-2">
                      {editingNoteId === note.id ? (
                        <>
                          <Textarea 
                            defaultValue={note.content}
                            onChange={(e) => setNewNote(e.target.value)}
                            autoFocus
                            rows={3}
                            className="mb-2"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleUpdateNote(note.id, newNote)}
                              className="gap-1"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              {note.stepId > 0 && (
                                <Badge variant="outline" className="mb-2">
                                  {steps.find(s => s.id === note.stepId)?.title || `Step ${note.stepId}`}
                                </Badge>
                              )}
                              <p className="whitespace-pre-wrap">{note.content}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingNoteId(note.id)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteNote(note.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {format(new Date(note.updatedAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Add New Reminder</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="reminder-title">Title</Label>
                  <Input 
                    id="reminder-title" 
                    placeholder="Reminder title" 
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="reminder-date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newReminderDate ? format(newReminderDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={newReminderDate}
                        onSelect={setNewReminderDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="reminder-description">Description (Optional)</Label>
                  <Textarea 
                    id="reminder-description" 
                    placeholder="Add more details..." 
                    rows={2}
                    value={newReminderDescription}
                    onChange={(e) => setNewReminderDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="reminder-notify">Notify Before</Label>
                    <Select 
                      value={newReminderDays.toString()}
                      onValueChange={(value) => setNewReminderDays(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Days before" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">On the day</SelectItem>
                        <SelectItem value="1">1 day before</SelectItem>
                        <SelectItem value="2">2 days before</SelectItem>
                        <SelectItem value="3">3 days before</SelectItem>
                        <SelectItem value="7">1 week before</SelectItem>
                        <SelectItem value="14">2 weeks before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="reminder-step">Related Step (Optional)</Label>
                    <Select 
                      value={newReminderStep?.toString() || ''}
                      onValueChange={(value) => setNewReminderStep(value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a step" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">General</SelectItem>
                        {steps.map(step => (
                          <SelectItem key={step.id} value={step.id.toString()}>
                            Step {step.stepOrder}: {step.title.substring(0, 20)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddReminder} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No reminders set</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add reminders for important deadlines and events.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map(reminder => (
                    <div 
                      key={reminder.id} 
                      className={`p-4 border rounded-lg ${
                        reminder.isCompleted ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Checkbox 
                              checked={reminder.isCompleted}
                              onCheckedChange={() => toggleReminderCompletion(reminder.id)}
                              id={`reminder-${reminder.id}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label 
                              htmlFor={`reminder-${reminder.id}`} 
                              className={`font-medium ${reminder.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {reminder.title}
                            </Label>
                            
                            {reminder.description && (
                              <p className={`text-sm ${reminder.isCompleted ? 'text-muted-foreground/70' : ''}`}>
                                {reminder.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(reminder.dueDate), 'MMM d, yyyy')}
                              </Badge>
                              
                              {reminder.stepId && (
                                <Badge variant="outline" className="text-xs">
                                  {steps.find(s => s.id === reminder.stepId)?.title || `Step ${reminder.stepId}`}
                                </Badge>
                              )}
                              
                              <Badge 
                                variant={
                                  new Date(reminder.dueDate) < new Date() 
                                    ? "destructive" 
                                    : "outline"
                                } 
                                className="text-xs"
                              >
                                {new Date(reminder.dueDate) < new Date() 
                                  ? "Overdue" 
                                  : `${reminder.notifyBefore} day${reminder.notifyBefore !== 1 ? 's' : ''} before`
                                }
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <Label htmlFor="checklist-item">Add Checklist Item</Label>
                    <Input 
                      id="checklist-item" 
                      placeholder="Enter a task..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="checklist-category">Category</Label>
                    <Select 
                      value={newItemCategory}
                      onValueChange={setNewItemCategory}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="forms">Forms</SelectItem>
                        <SelectItem value="appointments">Appointments</SelectItem>
                        <SelectItem value="deadlines">Deadlines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="checklist-step">Related Step</Label>
                    <Select 
                      value={newItemStep?.toString() || ''}
                      onValueChange={(value) => setNewItemStep(value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Step" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {steps.map(step => (
                          <SelectItem key={step.id} value={step.id.toString()}>
                            Step {step.stepOrder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddChecklistItem} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6 pt-2">
                {Object.keys(checklistByCategory).length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No checklist items</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a personalized checklist for your procedure.
                    </p>
                  </div>
                ) : (
                  Object.entries(checklistByCategory).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="font-medium capitalize flex items-center gap-2">
                        {category === 'general' && <CheckSquare className="h-4 w-4" />}
                        {category === 'documents' && <FileText className="h-4 w-4" />}
                        {category === 'forms' && <File className="h-4 w-4" />}
                        {category === 'appointments' && <Calendar className="h-4 w-4" />}
                        {category === 'deadlines' && <Clock className="h-4 w-4" />}
                        {category}
                      </h3>
                      
                      <div className="space-y-2 ml-6">
                        {items.map(item => (
                          <div key={item.id} className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <Checkbox 
                                checked={item.isCompleted}
                                onCheckedChange={() => toggleChecklistItemCompletion(item.id)}
                                id={`checklist-${item.id}`}
                                className="mt-0.5"
                              />
                              <div>
                                <Label 
                                  htmlFor={`checklist-${item.id}`} 
                                  className={item.isCompleted ? 'line-through text-muted-foreground' : ''}
                                >
                                  {item.text}
                                </Label>
                                {item.stepId && (
                                  <p className="text-xs text-muted-foreground">
                                    Related to: Step {
                                      steps.find(s => s.id === item.stepId)?.stepOrder || item.stepId
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteChecklistItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Personalization;