'use client';

import React, { useState } from 'react';
import { PencilLine, Send, StickyNote, Clock, Edit2, Trash2, X, Check } from 'lucide-react';
import { RichNote } from '@/context/AppContext';

interface NotesPanelProps {
  notes: RichNote[];
  onAddNote: (noteText: string) => void;
  onEditNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesPanel({ notes = [], onAddNote, onEditNote, onDeleteNote }: NotesPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAdding(true);
    setTimeout(() => {
      onAddNote(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    }, 400);
  };

  const handleStartEdit = (note: RichNote) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editText.trim()) return;
    onEditNote(noteId, editText.trim());
    setEditingNoteId(null);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm flex flex-col justify-between space-y-5 h-full">
      <div>
        <div className="flex items-center gap-2 font-bold text-sm text-zinc-200 border-b border-zinc-900 pb-3 mb-4">
          <StickyNote className="w-4.5 h-4.5 text-violet-400" />
          Internal Matchmaker Notes
        </div>

        {/* Notes Timeline List */}
        {notes.length > 0 ? (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1.5 animate-fadeIn group/note"
              >
                <div className="flex items-center justify-between text-[9px] text-zinc-500 font-semibold">
                  <span className="text-violet-400">{note.author || 'Senior Matchmaker'}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                    
                    {/* Notes Actions (Edit/Delete) */}
                    {editingNoteId !== note.id && (
                      <div className="hidden group-hover/note:flex items-center gap-1.5 transition-all">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                          title="Edit Note"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this note permanent?')) {
                              onDeleteNote(note.id);
                            }
                          }}
                          className="p-0.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingNoteId === note.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] flex items-center gap-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] flex items-center gap-0.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {note.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500 space-y-2">
            <PencilLine className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-xs font-semibold">No notes logged yet</p>
            <p className="text-[10px] text-zinc-650 max-w-[180px] mx-auto leading-4">
              Use the field below to write comments, interview briefs, or preferences logs.
            </p>
          </div>
        )}
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-900 pt-4 space-y-3">
        <textarea
          required
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new client brief, phone logs, or personality evaluation..."
          className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 text-xs resize-none transition-all"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAdding || !newNote.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAdding ? (
              <>
                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Add Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
