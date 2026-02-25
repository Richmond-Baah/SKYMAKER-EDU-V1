import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, GraduationCap, Calendar, User as UserIcon } from 'lucide-react'

interface ProfileHeaderProps {
    profile: {
        avatar_url?: string;
        username?: string;
        full_name?: string;
        role?: string;
        school?: string;
        grade_level?: string;
        country?: string;
        created_at: string;
    }
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const initials = (profile.full_name || profile.username || 'P')
        .substring(0, 2)
        .toUpperCase()

    const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                        <AvatarImage src={profile.avatar_url} alt={profile.username} />
                        <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <UserIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {profile.full_name || 'Anonymous Pilot'}
                        </h1>
                        <p className="text-muted-foreground font-mono text-lg">@{profile.username || 'pilot'}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>{profile.role || 'Student'} • {profile.grade_level || 'L1'}</span>
                        </div>
                        {profile.school && (
                            <div className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4" />
                                <span>{profile.school}</span>
                            </div>
                        )}
                        {profile.country && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.country}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {memberSince}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none px-3 py-1">
                            BEGINNER TRACK
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-none px-3 py-1">
                            RANK #124
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    )
}
