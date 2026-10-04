export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string;
          event_name: string;
          id: string;
          metadata: Json;
          page_path: string | null;
          session_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_name: string;
          id?: string;
          metadata?: Json;
          page_path?: string | null;
          session_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_name?: string;
          id?: string;
          metadata?: Json;
          page_path?: string | null;
          session_id?: string | null;
        };
        Relationships: [];
      };
      analytics_sessions: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          device_type: string | null;
          first_seen: string;
          id: string;
          is_returning: boolean;
          landing_page: string | null;
          last_seen: string;
          latitude: number | null;
          longitude: number | null;
          os: string | null;
          page_views: number;
          referrer: string | null;
          region: string | null;
          screen_resolution: string | null;
          session_id: string;
          traffic_source: string | null;
          utm_campaign: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          visitor_hash: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          device_type?: string | null;
          first_seen?: string;
          id?: string;
          is_returning?: boolean;
          landing_page?: string | null;
          last_seen?: string;
          latitude?: number | null;
          longitude?: number | null;
          os?: string | null;
          page_views?: number;
          referrer?: string | null;
          region?: string | null;
          screen_resolution?: string | null;
          session_id: string;
          traffic_source?: string | null;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          visitor_hash?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          device_type?: string | null;
          first_seen?: string;
          id?: string;
          is_returning?: boolean;
          landing_page?: string | null;
          last_seen?: string;
          latitude?: number | null;
          longitude?: number | null;
          os?: string | null;
          page_views?: number;
          referrer?: string | null;
          region?: string | null;
          screen_resolution?: string | null;
          session_id?: string;
          traffic_source?: string | null;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          visitor_hash?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_email: string | null;
          actor_id: string | null;
          browser: string | null;
          created_at: string;
          device: string | null;
          entity: string | null;
          entity_id: string | null;
          id: string;
          location: string | null;
          masked_ip: string | null;
          metadata: Json;
        };
        Insert: {
          action: string;
          actor_email?: string | null;
          actor_id?: string | null;
          browser?: string | null;
          created_at?: string;
          device?: string | null;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          location?: string | null;
          masked_ip?: string | null;
          metadata?: Json;
        };
        Update: {
          action?: string;
          actor_email?: string | null;
          actor_id?: string | null;
          browser?: string | null;
          created_at?: string;
          device?: string | null;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          location?: string | null;
          masked_ip?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          current_method: string | null;
          email: string;
          entry_gates: number | null;
          exit_gates: number | null;
          id: string;
          location_type: string | null;
          message: string | null;
          name: string;
          organization: string | null;
          parking_slots: number | null;
          phone: string | null;
          status: Database["public"]["Enums"]["inquiry_status"];
          submission_page: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          current_method?: string | null;
          email: string;
          entry_gates?: number | null;
          exit_gates?: number | null;
          id?: string;
          location_type?: string | null;
          message?: string | null;
          name: string;
          organization?: string | null;
          parking_slots?: number | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["inquiry_status"];
          submission_page?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          current_method?: string | null;
          email?: string;
          entry_gates?: number | null;
          exit_gates?: number | null;
          id?: string;
          location_type?: string | null;
          message?: string | null;
          name?: string;
          organization?: string | null;
          parking_slots?: number | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["inquiry_status"];
          submission_page?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_versions: {
        Row: {
          changed_by: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          snapshot: Json;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          snapshot: Json;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          snapshot?: Json;
        };
        Relationships: [];
      };
      inquiry_notes: {
        Row: {
          author_id: string | null;
          created_at: string;
          id: string;
          note: string;
          submission_id: string;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          note: string;
          submission_id: string;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string;
          submission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "contact_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          published_at: string | null;
          seo: Json;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          published_at?: string | null;
          seo?: Json;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          published_at?: string | null;
          seo?: Json;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          last_login_at: string | null;
          last_login_device: string | null;
          last_login_ip_masked: string | null;
          last_login_location: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          last_login_at?: string | null;
          last_login_device?: string | null;
          last_login_ip_masked?: string | null;
          last_login_location?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          last_login_at?: string | null;
          last_login_device?: string | null;
          last_login_ip_masked?: string | null;
          last_login_location?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      sections: {
        Row: {
          content: Json;
          created_at: string;
          display_order: number;
          id: string;
          is_visible: boolean;
          page_id: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_visible?: boolean;
          page_id: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_visible?: boolean;
          page_id?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sections_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content: {
        Row: {
          created_at: string;
          data: Json;
          description: string | null;
          display_order: number;
          id: string;
          is_published: boolean;
          section_key: string;
          subtitle: string | null;
          title: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          data?: Json;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_published?: boolean;
          section_key: string;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          data?: Json;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_published?: boolean;
          section_key?: string;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      website_settings: {
        Row: {
          data: Json;
          id: string;
          setting_key: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          data?: Json;
          id?: string;
          setting_key: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          data?: Json;
          id?: string;
          setting_key?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "super_admin" | "content_editor" | "analytics_viewer" | "inquiry_manager";
      inquiry_status:
        "new" | "contacted" | "qualified" | "in_progress" | "completed" | "closed" | "spam";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "content_editor", "analytics_viewer", "inquiry_manager"],
      inquiry_status: [
        "new",
        "contacted",
        "qualified",
        "in_progress",
        "completed",
        "closed",
        "spam",
      ],
    },
  },
} as const;
