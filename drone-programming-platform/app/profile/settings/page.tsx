"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { User, Shield, Bell, Palette, Save, Loader2, Camera, Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { uploadAvatar } from '@/lib/supabase/storage'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    // Form states
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [school, setSchool] = useState('')
    const [gradeLevel, setGradeLevel] = useState('')
    const [country, setCountry] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const [privacy, setPrivacy] = useState({
        profile_visibility: 'public',
        show_on_leaderboard: true,
        share_with_teacher: true
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            setProfile(data)
            setUsername(data.username || '')
            setFullName(data.full_name || '')
            setBio(data.bio || '')
            setSchool(data.school || '')
            setGradeLevel(data.grade_level || '')
            setCountry(data.country || '')
            setAvatarUrl(data.avatar_url || '')
            if (data.privacy_settings) setPrivacy(data.privacy_settings)
        }
        setLoading(false)
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file')
                return
            }

            // Validate file size (e.g., 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be under 2MB')
                return
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const publicUrl = await uploadAvatar(user.id, file)
            setAvatarUrl(publicUrl)
            toast.success('Avatar uploaded! Save changes to finalize.')
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message)
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username,
                    full_name: fullName,
                    bio,
                    school,
                    grade_level: gradeLevel,
                    country,
                    avatar_url: avatarUrl,
                    privacy_settings: privacy,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user!.id)

            if (profileError) throw profileError

            // Sync auth user metadata for global header updates
            const { error: authError } = await supabase.auth.updateUser({
                data: { avatar_url: avatarUrl }
            })

            if (authError) {
                console.warn('Auth metadata sync failed:', authError.message)
                // We don't throw here as the main profile was saved successfully
            }

            toast.success('Profile updated successfully!')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and profile information.</p>
            </div>

            {/* Profile Information */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Update your public profile details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar Upload Selection */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-muted/20 border border-border rounded-3xl border-dashed">
                        <div className="relative group cursor-pointer">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                <AvatarImage src={avatarUrl} alt={username} className="object-cover" />
                                <AvatarFallback className="bg-blue-500/10 text-blue-400 text-3xl font-black">
                                    {username ? username.substring(0, 2).toUpperCase() : 'P'}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer backdrop-blur-[2px]"
                            >
                                <Camera className="w-8 h-8 text-white mb-1" />
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">Update</span>
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-foreground">Mission Callsign Avatar</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">PNG, JPG or WEBP • MAX 2MB</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="drone_master"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Alex Kamau"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="resize-none h-24"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>School</Label>
                            <Input
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                placeholder="Nairobi Academy"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Grade Level</Label>
                            <Select value={gradeLevel} onValueChange={setGradeLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grade_7">Grade 7</SelectItem>
                                    <SelectItem value="grade_8">Grade 8</SelectItem>
                                    <SelectItem value="grade_9">Grade 9</SelectItem>
                                    <SelectItem value="grade_10">Grade 10</SelectItem>
                                    <SelectItem value="grade_11">Grade 11</SelectItem>
                                    <SelectItem value="grade_12">Grade 12</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Input
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="Kenya"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Privacy
                    </CardTitle>
                    <CardDescription>Control who can see your progress and activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                        <div className="space-y-0.5">
                            <Label className="text-base">Show on Leaderboard</Label>
                            <p className="text-xs text-muted-foreground">Allow your name and score to appear on the public ranking.</p>
                        </div>
                        <Switch
                            checked={privacy.show_on_leaderboard}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, show_on_leaderboard: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                        <div className="space-y-0.5">
                            <Label className="text-base">Share with Teacher</Label>
                            <p className="text-xs text-muted-foreground">Allow your designated teachers to view your mission code and progress.</p>
                        </div>
                        <Switch
                            checked={privacy.share_with_teacher}
                            onCheckedChange={(checked) => setPrivacy({ ...privacy, share_with_teacher: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-500" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Manage how you receive alerts and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-xl border border-border italic text-center">
                        Advanced notification settings coming soon in Phase 2.
                    </p>
                </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex justify-end gap-4 p-6 bg-card border border-border rounded-2xl shadow-lg sticky bottom-8 z-50">
                <Button variant="outline">Discard Changes</Button>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
