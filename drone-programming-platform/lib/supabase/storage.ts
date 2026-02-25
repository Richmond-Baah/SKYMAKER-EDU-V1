import { supabase } from './client'

/**
 * Uploads a file to a Supabase bucket.
 * The file is stored at path: {userId}/{fileName}
 */
export async function uploadAvatar(userId: string, file: File) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true
        })

    if (uploadError) {
        throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    return publicUrl
}

/**
 * Deletes an avatar file from storage if it belongs to the user.
 */
export async function deleteAvatar(path: string) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.storage
        .from('avatars')
        .remove([path])

    if (error) {
        throw error
    }
}
