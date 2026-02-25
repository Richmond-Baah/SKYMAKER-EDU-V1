"use client"

import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { beginnerLessons } from '@/lib/lessons'
import { createAssignment } from '@/lib/assignments'
import { toast } from 'sonner'
import { Copy, CheckCircle2, ShieldAlert, Target, Sparkles, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AssignmentBuilder({ onAssignmentCreated }: { onAssignmentCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [codeResult, setCodeResult] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  function toggle(id: string) {
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  }

  async function handleCreate() {
    if (selected.length === 0) {
      toast.error('Select at least one mission')
      return
    }

    // try server-side creation first (teacher API).
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-teacher-key': process.env.NEXT_PUBLIC_TEACHER_TOKEN || 'dev-teacher-token'
        },
        body: JSON.stringify({ missions: selected, title, description: description || null })
      })

      if (res.ok) {
        const a = await res.json()
        setCodeResult(a.code)
        toast.success('Assignment created (server)')
        onAssignmentCreated?.()
        return
      }
    } catch (err) {
      console.error('Failed to create assignment on server:', err)
    }

    const assignment = createAssignment(selected, title || `Assignment (${selected.length})`, null, description || null)
    setCodeResult(assignment.code)
    toast.success('Assignment created (local)')
    onAssignmentCreated?.()
  }

  function handleCopy() {
    if (codeResult) {
      navigator.clipboard?.writeText(codeResult)
      setIsCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      // Reset state when closing
      setSelected([])
      setTitle('')
      setDescription('')
      setCodeResult(null)
      setIsCopied(false)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold h-10 px-6 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> CREATE ASSIGNMENT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-card/95 backdrop-blur-xl border-purple-500/20 shadow-2xl overflow-hidden rounded-3xl p-0">

        {/* Subtle Ambient Background in Dialog */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none z-0" />

        <div className="relative p-8 flex flex-col h-[85vh] sm:h-auto max-h-[85vh]">
          <DialogHeader className="mb-6 shrink-0">
            <DialogTitle className="text-3xl font-black flex items-center gap-3 tracking-tighter text-foreground">
              <ClipboardList className="w-8 h-8 text-purple-500" />
              Mission Builder
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> Configure new training scenario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">

            {/* Metadata Inputs */}
            <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Assignment Title</label>
                <Input
                  placeholder="e.g. Week 1: Basic Telemetry & Navigation"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-background/50 border-border focus-visible:ring-purple-500 text-foreground font-medium h-10 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Briefing / Objectives</label>
                <Textarea
                  placeholder="Explain the goals of this assignment to your cadets..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none text-sm bg-background/50 border-border focus-visible:ring-purple-500 text-foreground rounded-xl custom-scrollbar"
                />
              </div>
            </div>

            {/* Mission Selection Grid */}
            <div className="space-y-3">
              <label className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" /> Select Curriculum Modules
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[35vh] overflow-y-auto p-1 custom-scrollbar">
                {beginnerLessons.map(l => {
                  const isSelected = selected.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      onClick={() => toggle(l.id)}
                      className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border group overflow-hidden ${isSelected
                        ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500'
                        : 'bg-card border-border hover:border-purple-500/30 hover:bg-muted/30'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-purple-500 animate-in zoom-in spin-in-12 duration-300">
                          <CheckCircle2 className="w-5 h-5 fill-purple-500/20" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2 pr-8">
                        <span className="font-mono text-[10px] text-muted-foreground group-hover:text-purple-400 transition-colors">{l.id.toUpperCase()}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 uppercase tracking-widest border-border ${l.tier === 'beginner' ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {l.tier}
                        </Badge>
                      </div>
                      <div className="font-bold text-sm text-foreground leading-tight mb-2 pr-6">{l.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-auto">{l.components.theory}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Success State - Code Generated */}
            {codeResult && (
              <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Assignment Broadcast Ready
                </div>
                <div className="text-sm text-foreground mb-4">
                  Share this unique access code with your students. They can redeem it on their Pilot Logs dashboard.
                </div>
                <div className="flex items-center gap-3 bg-background/80 p-2 rounded-xl border border-emerald-500/20">
                  <div className="font-mono font-bold text-xl px-4 py-2 rounded-lg flex-1 text-center text-foreground tracking-widest bg-emerald-500/5 selection:bg-emerald-500/30">
                    {codeResult}
                  </div>
                  <Button
                    size="icon"
                    className={`h-12 w-12 rounded-xl transition-all ${isCopied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                    onClick={handleCopy}
                  >
                    {isCopied ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 pt-6 border-t border-border shrink-0 flex-col sm:flex-row gap-3 items-center w-full">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest flex-1 text-center sm:text-left">
              {selected.length} {selected.length === 1 ? 'Module' : 'Modules'} Selected
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="ghost" className="h-10 rounded-xl" onClick={() => setOpen(false)}>
                CANCEL
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all w-full sm:w-auto"
                onClick={handleCreate}
                disabled={selected.length === 0}
              >
                {codeResult ? 'UPDATE ASSIGNMENT' : 'GENERATE MISSION CODE'}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
