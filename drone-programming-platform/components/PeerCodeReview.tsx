"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { CodeReview, CodeComment } from '@/types/peerReview'
import { toast } from 'sonner'

interface PeerCodeReviewProps {
  originalCode: string
  originalAuthor: string
  review?: CodeReview
  onSubmitComment?: (lineNumber: number, comment: string) => void
}

export function PeerCodeReview({ originalCode, originalAuthor, review, onSubmitComment }: PeerCodeReviewProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(null)

  function handleSubmitComment() {
    if (!selectedLine || !commentText.trim()) {
      toast.error('Select a line and enter a comment')
      return
    }
    onSubmitComment?.(selectedLine, commentText)
    setCommentText('')
    setSelectedLine(null)
    toast.success('Comment added')
  }

  const lines = originalCode.split('\n')
  const commentsByLine = new Map<number, CodeComment[]>()
  if (review) {
    review.comments.forEach(c => {
      if (!commentsByLine.has(c.lineNumber)) {
        commentsByLine.set(c.lineNumber, [])
      }
      commentsByLine.get(c.lineNumber)!.push(c)
    })
  }

  return (
    <div className="space-y-6">
      {/* Code Viewer */}
      <Card className="glass border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle>Code Review: {originalAuthor}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="bg-black/40 rounded font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto border border-white/10">
            {lines.map((line, idx) => (
              <div key={idx} className="flex">
                {/* Line number + click-to-comment */}
                <div
                  onClick={() => setSelectedLine(idx + 1)}
                  className={`w-12 text-right pr-3 py-1 text-white/40 cursor-pointer hover:bg-white/5 ${
                    selectedLine === idx + 1 ? 'bg-cyan-500/20' : ''
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Code */}
                <div className="flex-1 pl-3 py-1 text-white/80 break-words whitespace-pre-wrap">{line}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-white/40">Click a line number to add a comment</div>
        </CardContent>
      </Card>

      {/* Comment Input */}
      {selectedLine && (
        <Card className="glass border-amber-500/20 bg-amber-600/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Comment on Line {selectedLine}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Provide constructive feedback..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="h-20 text-xs"
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitComment} size="sm" className="gap-1">
                <Send className="w-3 h-3" /> Post Comment
              </Button>
              <Button onClick={() => { setSelectedLine(null); setCommentText('') }} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Comments */}
      {review && review.comments.length > 0 && (
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({review.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-auto">
            {Array.from(commentsByLine.entries()).map(([lineNum, comments]) => (
              <div key={lineNum} className="border-l-2 border-cyan-500/30 pl-3">
                <div className="text-xs font-bold text-cyan-400 mb-2">Line {lineNum}</div>
                {comments.map(comment => (
                  <div key={comment.id} className="text-xs space-y-1 mb-2 p-2 bg-white/3 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/80">{comment.authorId.slice(0, 8)}</span>
                      <span className="text-white/40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-white/70">{comment.comment}</div>
                    {comment.resolved && (
                      <Badge className="text-xs bg-emerald-500/20 text-emerald-400 w-fit">Resolved</Badge>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      {review && (
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Was this review helpful?</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              onClick={() => setRating('helpful')}
              variant={rating === 'helpful' ? 'default' : 'outline'}
              size="sm"
              className="gap-1"
            >
              <ThumbsUp className="w-3 h-3" /> Yes
            </Button>
            <Button
              onClick={() => setRating('not_helpful')}
              variant={rating === 'not_helpful' ? 'default' : 'outline'}
              size="sm"
              className="gap-1"
            >
              <ThumbsDown className="w-3 h-3" /> Not Really
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
