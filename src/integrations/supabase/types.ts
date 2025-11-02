export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          contact_name: string
          created_at: string
          current_music_system: string | null
          customer_count_estimate: string | null
          email: string
          id: string
          message: string | null
          phone: string | null
          physical_address: string | null
          status: string
          updated_at: string
          venue_name: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          current_music_system?: string | null
          customer_count_estimate?: string | null
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          physical_address?: string | null
          status?: string
          updated_at?: string
          venue_name: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          current_music_system?: string | null
          customer_count_estimate?: string | null
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          physical_address?: string | null
          status?: string
          updated_at?: string
          venue_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_queueing: boolean
          created_at: string
          dynamic_pricing: boolean | null
          email: string
          enable_pricing: boolean | null
          id: string
          is_admin: boolean
          logo_url: string | null
          physical_address: string
          static_price: number | null
          updated_at: string
          user_id: string
          venue_name: string
        }
        Insert: {
          allow_queueing?: boolean
          created_at?: string
          dynamic_pricing?: boolean | null
          email: string
          enable_pricing?: boolean | null
          id?: string
          is_admin?: boolean
          logo_url?: string | null
          physical_address: string
          static_price?: number | null
          updated_at?: string
          user_id: string
          venue_name: string
        }
        Update: {
          allow_queueing?: boolean
          created_at?: string
          dynamic_pricing?: boolean | null
          email?: string
          enable_pricing?: boolean | null
          id?: string
          is_admin?: boolean
          logo_url?: string | null
          physical_address?: string
          static_price?: number | null
          updated_at?: string
          user_id?: string
          venue_name?: string
        }
        Relationships: []
      }
      rejected_songs: {
        Row: {
          artist_name: string
          created_at: string
          id: string
          rejected_at: string
          rejection_reason: string | null
          song_id: string
          song_name: string
          venue_id: string
        }
        Insert: {
          artist_name: string
          created_at?: string
          id?: string
          rejected_at?: string
          rejection_reason?: string | null
          song_id: string
          song_name: string
          venue_id: string
        }
        Update: {
          artist_name?: string
          created_at?: string
          id?: string
          rejected_at?: string
          rejection_reason?: string | null
          song_id?: string
          song_name?: string
          venue_id?: string
        }
        Relationships: []
      }
      song_plays: {
        Row: {
          album_name: string | null
          artist_name: string
          created_at: string
          duration_ms: number | null
          id: string
          played_at: string
          song_id: string
          song_name: string
          venue_id: string
        }
        Insert: {
          album_name?: string | null
          artist_name: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          played_at?: string
          song_id: string
          song_name: string
          venue_id: string
        }
        Update: {
          album_name?: string | null
          artist_name?: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          played_at?: string
          song_id?: string
          song_name?: string
          venue_id?: string
        }
        Relationships: []
      }
      song_queue: {
        Row: {
          artist_name: string
          id: string
          position: number | null
          requested_at: string
          requester_name: string | null
          song_id: string
          song_name: string
          started_playing_at: string | null
          status: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          artist_name: string
          id?: string
          position?: number | null
          requested_at?: string
          requester_name?: string | null
          song_id: string
          song_name: string
          started_playing_at?: string | null
          status?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          artist_name?: string
          id?: string
          position?: number | null
          requested_at?: string
          requester_name?: string | null
          song_id?: string
          song_name?: string
          started_playing_at?: string | null
          status?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: []
      }
      spotify_credentials: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string | null
          id: string
          playlist_id: string | null
          refresh_token: string | null
          restrict_to_playlist: boolean | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string | null
          id?: string
          playlist_id?: string | null
          refresh_token?: string | null
          restrict_to_playlist?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string | null
          id?: string
          playlist_id?: string | null
          refresh_token?: string | null
          restrict_to_playlist?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      venue_revenue: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          source: string
          venue_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          source: string
          venue_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          source?: string
          venue_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_spotify_credentials: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_token: string
          client_id: string
          client_secret: string
          playlist_id: string
          refresh_token: string
          restrict_to_playlist: boolean
          token_expires_at: string
        }[]
      }
      get_venue_public_info: {
        Args: { venue_uuid: string }
        Returns: {
          allow_queueing: boolean
          created_at: string
          dynamic_pricing: boolean
          enable_pricing: boolean
          id: string
          logo_url: string
          restrict_to_playlist: boolean
          static_price: number
          venue_name: string
        }[]
      }
      is_user_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      upsert_spotify_credentials: {
        Args: {
          access_token?: string
          client_id?: string
          client_secret?: string
          expires_at?: string
          playlist_id?: string
          refresh_token?: string
          restrict_playlist?: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
