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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_scopes: {
        Row: {
          created_at: string | null
          description: string
          detailed_scope: string | null
          estimated_cost: number | null
          estimated_duration_days: number | null
          generated_at: string | null
          id: string
          loss_type: Database["public"]["Enums"]["loss_type"]
          material_list: Json | null
          model_used: string | null
          op_justification: string | null
          photo_urls: string[] | null
          project_address: string | null
          project_name: string
          scope_summary: string | null
          stage: Database["public"]["Enums"]["project_stage"] | null
          trades_required: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          detailed_scope?: string | null
          estimated_cost?: number | null
          estimated_duration_days?: number | null
          generated_at?: string | null
          id?: string
          loss_type: Database["public"]["Enums"]["loss_type"]
          material_list?: Json | null
          model_used?: string | null
          op_justification?: string | null
          photo_urls?: string[] | null
          project_address?: string | null
          project_name: string
          scope_summary?: string | null
          stage?: Database["public"]["Enums"]["project_stage"] | null
          trades_required?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          detailed_scope?: string | null
          estimated_cost?: number | null
          estimated_duration_days?: number | null
          generated_at?: string | null
          id?: string
          loss_type?: Database["public"]["Enums"]["loss_type"]
          material_list?: Json | null
          model_used?: string | null
          op_justification?: string | null
          photo_urls?: string[] | null
          project_address?: string | null
          project_name?: string
          scope_summary?: string | null
          stage?: Database["public"]["Enums"]["project_stage"] | null
          trades_required?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_type: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          organization_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_type?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          organization_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_type?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          cost_codes: Json | null
          created_at: string | null
          created_by: string | null
          default_project_templates: Json | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          time_zone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cost_codes?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_project_templates?: Json | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          time_zone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cost_codes?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_project_templates?: Json | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          time_zone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          assigned_to: string
          id: string
          notes: string | null
          project_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          assigned_to: string
          id?: string
          notes?: string | null
          project_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          assigned_to?: string
          id?: string
          notes?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_photos: {
        Row: {
          ai_category: string | null
          ai_confidence: number | null
          ai_damage_type: string | null
          ai_description: string | null
          ai_room_type: string | null
          ai_tags: string[] | null
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_after_photo: boolean | null
          is_before_photo: boolean | null
          location_lat: number | null
          location_lng: number | null
          mime_type: string | null
          notes: string | null
          organization_id: string
          project_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          ai_category?: string | null
          ai_confidence?: number | null
          ai_damage_type?: string | null
          ai_description?: string | null
          ai_room_type?: string | null
          ai_tags?: string[] | null
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_after_photo?: boolean | null
          is_before_photo?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          mime_type?: string | null
          notes?: string | null
          organization_id: string
          project_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          ai_category?: string | null
          ai_confidence?: number | null
          ai_damage_type?: string | null
          ai_description?: string | null
          ai_room_type?: string | null
          ai_tags?: string[] | null
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_after_photo?: boolean | null
          is_before_photo?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          mime_type?: string | null
          notes?: string | null
          organization_id?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_photos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          organization_id: string
          priority: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          organization_id: string
          priority?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          name?: string
          organization_id?: string
          priority?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_job_instances: {
        Row: {
          created_at: string
          id: string
          project_id: string
          scheduled_date: string
          skip_reason: string | null
          template_id: string
          was_skipped: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          scheduled_date: string
          skip_reason?: string | null
          template_id: string
          was_skipped?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          scheduled_date?: string
          skip_reason?: string | null
          template_id?: string
          was_skipped?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_job_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_job_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "recurring_job_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_job_templates: {
        Row: {
          address: string | null
          assigned_to: string | null
          auto_skip_conflicts: boolean | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          end_time: string
          id: string
          is_active: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          organization_id: string
          priority: string | null
          recurrence_day: number | null
          recurrence_pattern: string
          start_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          auto_skip_conflicts?: boolean | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          organization_id: string
          priority?: string | null
          recurrence_day?: number | null
          recurrence_pattern: string
          start_date: string
          start_time?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          auto_skip_conflicts?: boolean | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          name?: string
          organization_id?: string
          priority?: string | null
          recurrence_day?: number | null
          recurrence_pattern?: string
          start_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_job_templates_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_job_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_job_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_assignments: {
        Row: {
          created_at: string
          created_by: string
          end_time: string
          id: string
          notes: string | null
          project_id: string
          schedule_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_time: string
          id?: string
          notes?: string | null
          project_id: string
          schedule_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_time?: string
          id?: string
          notes?: string | null
          project_id?: string
          schedule_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "user_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_schedules: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          is_available: boolean | null
          notes: string | null
          organization_id: string
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          organization_id: string
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          organization_id?: string
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_recurring_jobs: {
        Args: {
          p_end_date: string
          p_start_date: string
          p_template_id: string
        }
        Returns: {
          generated_date: string
          skip_reason: string
          was_skipped: boolean
        }[]
      }
      is_organization_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      job_type: "mitigation" | "contents" | "reconstruction"
      loss_type: "water" | "fire" | "mold" | "storm" | "other"
      project_stage:
        | "emergency"
        | "mitigation"
        | "estimating"
        | "reconstruction"
        | "contents"
        | "closeout"
      user_role:
        | "owner"
        | "admin"
        | "executive"
        | "pm"
        | "estimator"
        | "insurance_coordinator"
        | "mitigation_lead"
        | "mitigation_tech"
        | "reconstruction_lead"
        | "contents_lead"
        | "coordinator"
        | "finance"
        | "equipment_manager"
        | "subcontractor"
        | "homeowner"
        | "adjuster"
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
    Enums: {
      job_type: ["mitigation", "contents", "reconstruction"],
      loss_type: ["water", "fire", "mold", "storm", "other"],
      project_stage: [
        "emergency",
        "mitigation",
        "estimating",
        "reconstruction",
        "contents",
        "closeout",
      ],
      user_role: [
        "owner",
        "admin",
        "executive",
        "pm",
        "estimator",
        "insurance_coordinator",
        "mitigation_lead",
        "mitigation_tech",
        "reconstruction_lead",
        "contents_lead",
        "coordinator",
        "finance",
        "equipment_manager",
        "subcontractor",
        "homeowner",
        "adjuster",
      ],
    },
  },
} as const
