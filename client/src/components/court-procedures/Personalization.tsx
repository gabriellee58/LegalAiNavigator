import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  StickyNote, Plus, Bell, Calendar as CalendarIcon, CheckSquare, Save, FileText as FileIcon,
  Trash2, Clock, Edit, Check, X, AlertCircle, Info
} from 'lucide-react';

// Temporary interfaces until we properly migrate them
interface ProcedureStep {
  id: number;
  procedureId: number;
  title: string;
  description: string;
  stepOrder: number;
  estimatedTime?: string;
  requiredDocuments?: string[];
  instructions?: string;
  tips?: string[];
  warnings?: string[];
  fees?: Record<string, string>;
  isOptional: boolean;
  nextStepIds?: number[];
  alternatePathInfo?: string | null;
  sourceReferences?: { name: string; url: string }[];
}

interface PersonalizationProps {
  procedureId: number;
  steps: ProcedureStep[];
  userProcedureId?: number;
}

const Personalization: React.FC<PersonalizationProps> = ({
  procedureId,
  steps,
  userProcedureId
}) => {
  const [activeTab, setActiveTab] = useState<string>('notes');
  
  // Notes state
  const [notes, setNotes] = useState<any[]>([
    {
      id: 1,
      stepId: 1,
      content: "Need to gather all supporting documents before filing the Notice of Civil Claim",
      createdAt: "2025-04-01T10:30:00Z"
    },
    {
      id: 2,
      stepId: null,
      content: "Schedule appointment with legal counsel to discuss strategy for the case",
      createdAt: "2025-04-03T14:15:00Z"
    }
  ]);
  const [newNote, setNewNote] = useState<string>('');
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState<string>('');
  
  // Reminders state
  const [reminders, setReminders] = useState<any[]>([
    {
      id: 1,
      title: "File Notice of Civil Claim",
      stepId: 1,
      dueDate: new Date("2025-05-15"),
      notifyBefore: 3,
      notifyMethod: "email",
      isCompleted: false,
      createdAt: "2025-04-02T09:00:00Z"
    },
    {
      id: 2,
      title: "Serve documents to other party",
      stepId: 2,
      dueDate: new Date("2025-05-20"),
      notifyBefore: 2,
      notifyMethod: "app",
      isCompleted: false,
      createdAt: "2025-04-03T11:30:00Z"
    }
  ]);
  const [newReminderTitle, setNewReminderTitle] = useState<string>('');
  const [newReminderDate, setNewReminderDate] = useState<Date | undefined>(undefined);
  const [newReminderDays, setNewReminderDays] = useState<number>(1);
  const [addReminderDialogOpen, setAddReminderDialogOpen] = useState<boolean>(false);
  
  // Checklist state
  const [checklist, setChecklist] = useState<any[]>([
    {
      id: 1,
      stepId: 1,
      text: "Collect all required documents",
      isCompleted: true,
      category: "preparation",
      createdAt: "2025-04-01T10:00:00Z"
    },
    {
      id: 2,
      stepId: 1,
      text: "Fill out Notice of Civil Claim form",
      isCompleted: false,
      category: "preparation",
      createdAt: "2025-04-01T10:05:00Z"
    },
    {
      id: 3,
      stepId: 2,
      text: "Make copies of all documents",
      isCompleted: false,
      category: "preparation",
      createdAt: "2025-04-03T14:30:00Z"
    }
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState<string>('');
  const [selectedChecklistCategory, setSelectedChecklistCategory] = useState<string>("preparation");
  
  // Handle add note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteObj = {
      id: notes.length + 1,
      stepId: selectedStepId,
      content: newNote,
      createdAt: new Date().toISOString()
    };
    
    setNotes([...notes, newNoteObj]);
    setNewNote('');
    setSelectedStepId(null);
  };
  
  // Handle edit note
  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };
  
  // Handle save note edit
  const handleSaveNoteEdit = (noteId: number) => {
    if (!editingNoteContent.trim()) return;
    
    setNotes(notes.map(note => 
      note.id === noteId 
        ? {...note, content: editingNoteContent } 
        : note
    ));
    
    setEditingNoteId(null);
    setEditingNoteContent('');
  };
  
  // Handle delete note
  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };
  
  // Handle add reminder
  const handleAddReminder = () => {
    if (!newReminderTitle.trim() || !newReminderDate) return;
    
    const newReminderObj = {
      id: reminders.length + 1,
      title: newReminderTitle,
      stepId: selectedStepId,
      dueDate: newReminderDate,
      notifyBefore: newReminderDays,
      notifyMethod: "app",
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    
    setReminders([...reminders, newReminderObj]);
    setNewReminderTitle('');
    setNewReminderDate(undefined);
    setNewReminderDays(1);
    setSelectedStepId(null);
    setAddReminderDialogOpen(false);
  };
  
  // Handle toggle reminder completion
  const handleToggleReminder = (reminderId: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId 
        ? {...reminder, isCompleted: !reminder.isCompleted } 
        : reminder
    ));
  };
  
  // Handle delete reminder
  const handleDeleteReminder = (reminderId: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
  };
  
  // Handle add checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: checklist.length + 1,
      stepId: selectedStepId,
      text: newChecklistItem,
      isCompleted: false,
      category: selectedChecklistCategory,
      createdAt: new Date().toISOString()
    };
    
    setChecklist([...checklist, newItem]);
    setNewChecklistItem('');
  };
  
  // Handle toggle checklist item
  const handleToggleChecklistItem = (itemId: number) => {
    setChecklist(checklist.map(item => 
      item.id === itemId 
        ? {...item, isCompleted: !item.isCompleted } 
        : item
    ));
  };
  
  // Handle delete checklist item
  const handleDeleteChecklistItem = (itemId: number) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Personalization Tools
          </CardTitle>
          <CardDescription>
            Keep track of your own notes, reminders, and custom checklist items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
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
            <TabsContent value="notes" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="new-note">Add a new note</Label>
                  
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Textarea
                        id="new-note"
                        placeholder="Type your note here..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="h-[80px]"
                      />
                      <div className="mt-2">
                        <Label htmlFor="note-step" className="text-xs text-muted-foreground mr-2">
                          Related step (optional):
                        </Label>
                        <select
                          id="note-step"
                          value={selectedStepId !== null ? selectedStepId : ''}
                          onChange={(e) => setSelectedStepId(e.target.value ? parseInt(e.target.value) : null)}
                          className="text-xs bg-background border rounded px-2 py-1"
                        >
                          <option value="">General note</option>
                          {steps.map(step => (
                            <option key={step.id} value={step.id}>
                              Step {step.stepOrder}: {step.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddNote} 
                      disabled={!newNote.trim()} 
                      size="sm"
                      className="mt-1"
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8">
                      <StickyNote className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No notes yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add notes to keep track of important information
                      </p>
                    </div>
                  ) : (
                    notes.map(note => (
                      <div 
                        key={note.id} 
                        className={`border rounded-lg p-4 relative ${
                          editingNoteId === note.id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        {editingNoteId === note.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              className="w-full"
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => {
                                  setEditingNoteId(null);
                                  setEditingNoteContent('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveNoteEdit(note.id)}
                                disabled={!editingNoteContent.trim()}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="whitespace-pre-wrap">{note.content}</p>
                                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                  <span className="mr-3">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                  {note.stepId && steps.find(s => s.id === note.stepId) && (
                                    <Badge variant="outline" className="text-xs font-normal">
                                      Step {steps.find(s => s.id === note.stepId)?.stepOrder}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditNote(note)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="h-8 w-8 p-0 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Reminders Tab */}
            <TabsContent value="reminders" className="space-y-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Your Reminders</h3>
                <Dialog open={addReminderDialogOpen} onOpenChange={setAddReminderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add Reminder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Reminder</DialogTitle>
                      <DialogDescription>
                        Create a reminder with a due date for your procedure
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reminder-title">Title</Label>
                        <Input
                          id="reminder-title"
                          placeholder="E.g., File Notice of Civil Claim"
                          value={newReminderTitle}
                          onChange={(e) => setNewReminderTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newReminderDate ? (
                                format(newReminderDate, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newReminderDate}
                              onSelect={setNewReminderDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notify-days">Notify Days Before</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="notify-days"
                            type="number"
                            min={1}
                            max={30}
                            value={newReminderDays}
                            onChange={(e) => setNewReminderDays(parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                          <span className="text-sm">days before due date</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reminder-step">Related step (optional)</Label>
                        <select
                          id="reminder-step"
                          value={selectedStepId !== null ? selectedStepId : ''}
                          onChange={(e) => setSelectedStepId(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">General reminder</option>
                          {steps.map(step => (
                            <option key={step.id} value={step.id}>
                              Step {step.stepOrder}: {step.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setAddReminderDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddReminder}
                        disabled={!newReminderTitle.trim() || !newReminderDate}
                      >
                        Add Reminder
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-3">
                {reminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No reminders yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add reminders to stay on track with important deadlines
                    </p>
                  </div>
                ) : (
                  reminders.map(reminder => (
                    <div 
                      key={reminder.id} 
                      className={`border rounded-lg p-4 ${
                        reminder.isCompleted ? 'bg-muted/30' : ''
                      } ${
                        new Date(reminder.dueDate) < new Date() && !reminder.isCompleted
                          ? 'border-destructive/50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`reminder-${reminder.id}`}
                            checked={reminder.isCompleted}
                            onCheckedChange={() => handleToggleReminder(reminder.id)}
                            className="mt-1"
                          />
                          <div>
                            <Label
                              htmlFor={`reminder-${reminder.id}`}
                              className={`font-medium ${
                                reminder.isCompleted ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {reminder.title}
                            </Label>
                            <div className="text-sm text-muted-foreground mt-1">
                              <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>
                                    Due: {format(new Date(reminder.dueDate), "MMM d, yyyy")}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Notify: {reminder.notifyBefore} {reminder.notifyBefore === 1 ? 'day' : 'days'} before
                                  </span>
                                </div>
                                
                                {reminder.stepId && steps.find(s => s.id === reminder.stepId) && (
                                  <Badge variant="outline" className="font-normal text-xs">
                                    Step {steps.find(s => s.id === reminder.stepId)?.stepOrder}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {new Date(reminder.dueDate) < new Date() && !reminder.isCompleted && (
                        <div className="mt-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded text-xs flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          This reminder is overdue
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            {/* Checklist Tab */}
            <TabsContent value="checklist" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="new-checklist">Add a new checklist item</Label>
                  
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        id="new-checklist"
                        placeholder="E.g., Gather required documents"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor="checklist-category" className="text-muted-foreground">
                            Category:
                          </Label>
                          <select
                            id="checklist-category"
                            value={selectedChecklistCategory}
                            onChange={(e) => setSelectedChecklistCategory(e.target.value)}
                            className="bg-background border rounded px-2 py-1"
                          >
                            <option value="preparation">Preparation</option>
                            <option value="documents">Documents</option>
                            <option value="filing">Filing</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor="checklist-step" className="text-muted-foreground">
                            For step:
                          </Label>
                          <select
                            id="checklist-step"
                            value={selectedStepId !== null ? selectedStepId : ''}
                            onChange={(e) => setSelectedStepId(e.target.value ? parseInt(e.target.value) : null)}
                            className="bg-background border rounded px-2 py-1"
                          >
                            <option value="">General</option>
                            {steps.map(step => (
                              <option key={step.id} value={step.id}>
                                Step {step.stepOrder}: {step.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddChecklistItem} 
                      disabled={!newChecklistItem.trim()} 
                      size="sm"
                      className="mt-1"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
                
                {checklist.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No checklist items yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add checklist items to track your progress
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group checklist items by category */}
                    {['preparation', 'documents', 'filing', 'other'].map(category => {
                      const categoryItems = checklist.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <h3 className="text-sm font-medium capitalize">{category}</h3>
                          <div className="space-y-2">
                            {categoryItems.map(item => (
                              <div 
                                key={item.id} 
                                className={`flex items-start justify-between border rounded-lg p-3 ${
                                  item.isCompleted ? 'bg-muted/30' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id={`checklist-${item.id}`}
                                    checked={item.isCompleted}
                                    onCheckedChange={() => handleToggleChecklistItem(item.id)}
                                    className="mt-1"
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`checklist-${item.id}`}
                                      className={item.isCompleted ? 'line-through text-muted-foreground' : ''}
                                    >
                                      {item.text}
                                    </Label>
                                    {item.stepId && steps.find(s => s.id === item.stepId) && (
                                      <div className="mt-1">
                                        <Badge variant="outline" className="font-normal text-xs">
                                          Step {steps.find(s => s.id === item.stepId)?.stepOrder}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteChecklistItem(item.id)}
                                  className="h-8 w-8 p-0 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Personalization;