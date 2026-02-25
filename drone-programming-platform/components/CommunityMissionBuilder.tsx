'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommunityMission, CommunityMissionDiscoveryFilter } from '@/types/communityMission'
import { AlertCircle, Star, Eye, Check, Flame } from 'lucide-react'

interface CommunityMissionBuilderProps {
  currentUserId: string
  currentUserName: string
  onPublish?: (mission: CommunityMission) => void
}

export function CommunityMissionBuilder({ currentUserId, currentUserName, onPublish }: CommunityMissionBuilderProps) {
  const [tab, setTab] = useState<'discover' | 'create'>('discover')

  // Discovery state
  const [missions, setMissions] = useState<CommunityMission[]>([])
  const [selectedMission, setSelectedMission] = useState<CommunityMission | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  // Create state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as const,
    category: 'formation',
    objectives: '',
    starterCode: '',
    tags: '' // comma-separated
  })

  const loadMissions = useCallback(() => {
    // Placeholder: In production, fetch from API
    const mockMissions: CommunityMission[] = [
      {
        id: '1',
        title: 'Formation Leadership',
        description: 'Learn to program drone formations with a leader-follower pattern.',
        creatorId: 'user123',
        creatorName: 'Alex Chen',
        difficulty: 'intermediate',
        category: 'formation',
        objectives: 'Create a 4-drone formation that follows a triangular path.',
        starterCode: `# Formation leader script\ndrone1.formation_lead(shape='triangle')\ndrone1.hover()`,
        successCriteria: [
          { name: 'Triangle formed', description: 'Drones maintain formation', validator: 'formation_valid', points: 25 },
          { name: 'Path complete', description: 'All waypoints visited', validator: 'waypoints_hit', points: 25 }
        ],
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        popularity: { views: 342, attempts: 127, completions: 89, rating: 4.6, ratingCount: 56 },
        tags: ['formation', 'coordination', 'beginner-friendly']
      },
      {
        id: '2',
        title: 'Obstacle Avoidance Race',
        description: 'Navigate through a challenging obstacle course at speed.',
        creatorId: 'user456',
        creatorName: 'Jordan Lee',
        difficulty: 'advanced',
        category: 'obstacle',
        objectives: 'Complete the obstacle course in under 60 seconds.',
        starterCode: `# Obstacle avoidance\nwhile not mission_complete():\n  if obstacle_ahead():\n    drone.dodge_left()\n  drone.forward(speed=2)`,
        successCriteria: [
          { name: 'All gates passed', description: 'Pass through all waypoint gates', validator: 'all_gates_passed', points: 40 },
          { name: 'Time under 60s', description: 'Complete within time limit', validator: 'time_check', points: 60 }
        ],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        popularity: { views: 512, attempts: 203, completions: 45, rating: 4.2, ratingCount: 89 },
        tags: ['advanced', 'racing', 'reflexes']
      }
    ]

    let filtered = mockMissions
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.popularity.attempts - a.popularity.attempts)
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.popularity.rating - a.popularity.rating)
    }

    setMissions(filtered)
  }, [searchQuery, sortBy])

  // Simulate load featured missions
  React.useEffect(() => {
    if (tab === 'discover') {
      loadMissions()
    }
  }, [tab, loadMissions])

  const handlePublish = async () => {
    if (!createForm.title || !createForm.description) {
      alert('Please fill in title and description')
      return
    }

    const newMission: CommunityMission = {
      id: Date.now().toString(),
      title: createForm.title,
      description: createForm.description,
      creatorId: currentUserId,
      creatorName: currentUserName,
      difficulty: createForm.difficulty,
      category: createForm.category,
      objectives: createForm.objectives,
      starterCode: createForm.starterCode,
      successCriteria: [],
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      popularity: { views: 0, attempts: 0, completions: 0, rating: 0, ratingCount: 0 },
      tags: createForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    onPublish?.(newMission)
    setCreateForm({
      title: '',
      description: '',
      difficulty: 'beginner',
      category: 'formation',
      objectives: '',
      starterCode: '',
      tags: ''
    })
    alert('Mission published successfully!')
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Missions</h1>
        <p className="text-gray-400 mt-1">Discover missions from other pilots or create your own</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Discovery Controls */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Search missions</Label>
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-40">
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <option value="newest">Newest</option>
                <option value="popular">Most Attempted</option>
                <option value="rating">Highest Rated</option>
              </Select>
            </div>
          </div>

          {/* Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => (
              <Card
                key={mission.id}
                className="p-4 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setSelectedMission(mission)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg flex-1">{mission.title}</h3>
                  <Badge variant={mission.difficulty === 'beginner' ? 'outline' : mission.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                    {mission.difficulty}
                  </Badge>
                </div>

                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{mission.description}</p>

                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {mission.popularity.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame size={14} />
                    {mission.popularity.attempts}
                  </div>
                  <div className="flex items-center gap-1">
                    <Check size={14} />
                    {mission.popularity.completions}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-500" />
                    {mission.popularity.rating.toFixed(1)}
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {mission.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-gray-600 mt-3">
                  by <span className="font-medium text-gray-400">{mission.creatorName}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Mission Detail View */}
          {selectedMission && (
            <Card className="p-6 border-blue-500 bg-blue-950/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedMission.title}</h2>
                  <p className="text-gray-400">{selectedMission.description}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedMission(null)}>
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <Label className="text-gray-400">Difficulty</Label>
                  <p className="mt-1 font-medium capitalize">{selectedMission.difficulty}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Category</Label>
                  <p className="mt-1 font-medium capitalize">{selectedMission.category}</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-gray-400">Objectives</Label>
                <p className="mt-1 font-medium">{selectedMission.objectives}</p>
              </div>

              <div className="mb-4">
                <Label className="text-gray-400">Starter Code</Label>
                <pre className="mt-1 p-3 bg-black/50 rounded text-xs overflow-auto max-h-32">
                  {selectedMission.starterCode}
                </pre>
              </div>

              <Button className="w-full">Start Mission</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="p-6 border-green-500/20 bg-green-950/10">
            <h2 className="text-xl font-bold mb-4">Create Your Own Mission</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Mission Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Diamond Formation Challenge"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your mission in a few sentences..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="mt-1 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={createForm.difficulty}
                    onValueChange={(v) => setCreateForm({ ...createForm, difficulty: v as any })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={createForm.category}
                    onValueChange={(v) => setCreateForm({ ...createForm, category: v })}
                  >
                    <option value="formation">Formation</option>
                    <option value="choreography">Choreography</option>
                    <option value="obstacle">Obstacle Course</option>
                    <option value="search_rescue">Search & Rescue</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="objectives">Mission Objectives</Label>
                <Textarea
                  id="objectives"
                  placeholder="What should the pilot accomplish?"
                  value={createForm.objectives}
                  onChange={(e) => setCreateForm({ ...createForm, objectives: e.target.value })}
                  className="mt-1 h-20"
                />
              </div>

              <div>
                <Label htmlFor="starterCode">Starter Code Template</Label>
                <Textarea
                  id="starterCode"
                  placeholder="Provide starter code for pilots..."
                  value={createForm.starterCode}
                  onChange={(e) => setCreateForm({ ...createForm, starterCode: e.target.value })}
                  className="mt-1 h-24 font-mono text-xs"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., formation, advanced, teamwork"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 p-3 bg-blue-950/30 rounded border border-blue-500/30">
                <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  Your mission will be reviewed by the community. High-quality missions may be featured!
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePublish} className="flex-1 bg-green-600 hover:bg-green-700">
                  Publish Mission
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreateForm({
                      title: '',
                      description: '',
                      difficulty: 'beginner',
                      category: 'formation',
                      objectives: '',
                      starterCode: '',
                      tags: ''
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
