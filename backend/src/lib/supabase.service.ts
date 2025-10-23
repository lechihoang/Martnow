import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as SupabaseClient;
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Utility method for file upload to Supabase Storage (alternative to Cloudinary)
  async uploadFile(
    bucket: string,
    fileName: string,
    file: Buffer,
    options?: { contentType?: string; cacheControl?: string },
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return data;
  }

  // Get public URL for uploaded file
  getPublicUrl(bucket: string, fileName: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Delete file from storage
  async deleteFile(bucket: string, fileName: string) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return true;
  }

  // Real-time subscription helper
  createRealtimeChannel(channelName: string) {
    return this.supabase.channel(channelName);
  }

  // Database query helper (though TypeORM should be primary)
  from(table: string) {
    return this.supabase.from(table);
  }
}
