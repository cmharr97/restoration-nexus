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
      announcement_comments: {
        Row: {
          announcement_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reactions: {
        Row: {
          announcement_id: string
          created_at: string
          id: string
          reaction: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          id?: string
          reaction: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reactions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_pinned: boolean
          organization_id: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          organization_id: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          organization_id?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_direct_message: boolean
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_direct_message?: boolean
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_direct_message?: boolean
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachments: Json | null
          channel_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          channel_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          blockers: string | null
          check_in_date: string
          created_at: string
          id: string
          mood: string | null
          organization_id: string
          project_updates: Json | null
          status: string
          user_id: string
          what_accomplished: string | null
          what_planning: string | null
        }
        Insert: {
          blockers?: string | null
          check_in_date: string
          created_at?: string
          id?: string
          mood?: string | null
          organization_id: string
          project_updates?: Json | null
          status?: string
          user_id: string
          what_accomplished?: string | null
          what_planning?: string | null
        }
        Update: {
          blockers?: string | null
          check_in_date?: string
          created_at?: string
          id?: string
          mood?: string | null
          organization_id?: string
          project_updates?: Json | null
          status?: string
          user_id?: string
          what_accomplished?: string | null
          what_planning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contents_inventory: {
        Row: {
          category: string | null
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string | null
          customer_signature: string | null
          description: string | null
          estimated_value: number | null
          id: string
          item_name: string
          notes: string | null
          organization_id: string
          packed_date: string | null
          photos: string[] | null
          project_id: string
          qr_code: string | null
          returned_date: string | null
          room: string | null
          specialist_id: string
          storage_location: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          condition: Database["public"]["Enums"]["item_condition"]
          created_at?: string | null
          customer_signature?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          item_name: string
          notes?: string | null
          organization_id: string
          packed_date?: string | null
          photos?: string[] | null
          project_id: string
          qr_code?: string | null
          returned_date?: string | null
          room?: string | null
          specialist_id: string
          storage_location?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string | null
          customer_signature?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          item_name?: string
          notes?: string | null
          organization_id?: string
          packed_date?: string | null
          photos?: string[] | null
          project_id?: string
          qr_code?: string | null
          returned_date?: string | null
          room?: string | null
          specialist_id?: string
          storage_location?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contents_inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_inventory_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portals: {
        Row: {
          access_token: string
          created_at: string | null
          customer_email: string
          customer_name: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_accessed: string | null
          organization_id: string
          project_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          organization_id: string
          project_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          organization_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_portals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          current_project_id: string | null
          equipment_type: Database["public"]["Enums"]["equipment_type"]
          hourly_rate: number | null
          id: string
          last_maintenance: string | null
          model: string | null
          next_maintenance: string | null
          notes: string | null
          organization_id: string
          runtime_hours: number | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          current_project_id?: string | null
          equipment_type: Database["public"]["Enums"]["equipment_type"]
          hourly_rate?: number | null
          id?: string
          last_maintenance?: string | null
          model?: string | null
          next_maintenance?: string | null
          notes?: string | null
          organization_id: string
          runtime_hours?: number | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          current_project_id?: string | null
          equipment_type?: Database["public"]["Enums"]["equipment_type"]
          hourly_rate?: number | null
          id?: string
          last_maintenance?: string | null
          model?: string | null
          next_maintenance?: string | null
          notes?: string | null
          organization_id?: string
          runtime_hours?: number | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_current_project_id_fkey"
            columns: ["current_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          organization_id: string
          project_id: string
          receipt_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          organization_id: string
          project_id: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          organization_id?: string
          project_id?: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          approved_by: string | null
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          documents: string[] | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          organization_id: string
          paid_date: string | null
          payment_status: string | null
          project_id: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          documents?: string[] | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id: string
          paid_date?: string | null
          payment_status?: string | null
          project_id: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          documents?: string[] | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string
          paid_date?: string | null
          payment_status?: string | null
          project_id?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_boards: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          project_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          project_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_boards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_boards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          assigned_to: string | null
          column_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          labels: Json | null
          position: number
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          column_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: Json | null
          position: number
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          column_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: Json | null
          position?: number
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          board_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position: number
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          ai_damage_estimate: number | null
          ai_triage_score: number | null
          assigned_to: string | null
          converted_project_id: string | null
          created_at: string | null
          created_by: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          damage_type: Database["public"]["Enums"]["damage_type"]
          id: string
          initial_photos: string[] | null
          notes: string | null
          organization_id: string
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          address?: string | null
          ai_damage_estimate?: number | null
          ai_triage_score?: number | null
          assigned_to?: string | null
          converted_project_id?: string | null
          created_at?: string | null
          created_by: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          damage_type: Database["public"]["Enums"]["damage_type"]
          id?: string
          initial_photos?: string[] | null
          notes?: string | null
          organization_id: string
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          address?: string | null
          ai_damage_estimate?: number | null
          ai_triage_score?: number | null
          assigned_to?: string | null
          converted_project_id?: string | null
          created_at?: string | null
          created_by?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          damage_type?: Database["public"]["Enums"]["damage_type"]
          id?: string
          initial_photos?: string[] | null
          notes?: string | null
          organization_id?: string
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_project_id_fkey"
            columns: ["converted_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mitigation_logs: {
        Row: {
          alert_flags: string[] | null
          created_at: string | null
          drying_progress: number | null
          equipment_deployed: Json | null
          id: string
          log_date: string
          moisture_readings: Json | null
          notes: string | null
          organization_id: string
          photos: string[] | null
          project_id: string
          relative_humidity: number | null
          status: string | null
          tech_id: string
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          alert_flags?: string[] | null
          created_at?: string | null
          drying_progress?: number | null
          equipment_deployed?: Json | null
          id?: string
          log_date: string
          moisture_readings?: Json | null
          notes?: string | null
          organization_id: string
          photos?: string[] | null
          project_id: string
          relative_humidity?: number | null
          status?: string | null
          tech_id: string
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_flags?: string[] | null
          created_at?: string | null
          drying_progress?: number | null
          equipment_deployed?: Json | null
          id?: string
          log_date?: string
          moisture_readings?: Json | null
          notes?: string | null
          organization_id?: string
          photos?: string[] | null
          project_id?: string
          relative_humidity?: number | null
          status?: string | null
          tech_id?: string
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mitigation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mitigation_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
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
      project_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          organization_id: string
          project_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          organization_id: string
          project_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          organization_id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      project_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          organization_id: string
          project_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id: string
          project_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          organization_id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          organization_id: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          organization_id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_project_id_fkey"
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
          actual_completion_date: string | null
          actual_cost: number | null
          address: string | null
          adjuster_email: string | null
          adjuster_name: string | null
          adjuster_phone: string | null
          assigned_to: string | null
          city: string | null
          claim_number: string | null
          created_at: string
          created_by: string
          deductible: number | null
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          id: string
          insurance_carrier: string | null
          job_type: Database["public"]["Enums"]["job_type"]
          loss_date: string | null
          loss_description: string | null
          loss_type: string | null
          name: string
          notes: string | null
          organization_id: string
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          policy_number: string | null
          priority: string | null
          project_number: string | null
          start_date: string | null
          state: string | null
          status: string
          target_completion_date: string | null
          template_used: string | null
          tpa_name: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          actual_cost?: number | null
          address?: string | null
          adjuster_email?: string | null
          adjuster_name?: string | null
          adjuster_phone?: string | null
          assigned_to?: string | null
          city?: string | null
          claim_number?: string | null
          created_at?: string
          created_by: string
          deductible?: number | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          id?: string
          insurance_carrier?: string | null
          job_type: Database["public"]["Enums"]["job_type"]
          loss_date?: string | null
          loss_description?: string | null
          loss_type?: string | null
          name: string
          notes?: string | null
          organization_id: string
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          policy_number?: string | null
          priority?: string | null
          project_number?: string | null
          start_date?: string | null
          state?: string | null
          status?: string
          target_completion_date?: string | null
          template_used?: string | null
          tpa_name?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          actual_cost?: number | null
          address?: string | null
          adjuster_email?: string | null
          adjuster_name?: string | null
          adjuster_phone?: string | null
          assigned_to?: string | null
          city?: string | null
          claim_number?: string | null
          created_at?: string
          created_by?: string
          deductible?: number | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          id?: string
          insurance_carrier?: string | null
          job_type?: Database["public"]["Enums"]["job_type"]
          loss_date?: string | null
          loss_description?: string | null
          loss_type?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          policy_number?: string | null
          priority?: string | null
          project_number?: string | null
          start_date?: string | null
          state?: string | null
          status?: string
          target_completion_date?: string | null
          template_used?: string | null
          tpa_name?: string | null
          updated_at?: string
          zip?: string | null
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
      recon_assessments: {
        Row: {
          affected_areas: Json | null
          ai_damage_tags: string[] | null
          ai_estimate: number | null
          approved_by: string | null
          completed_at: string | null
          created_at: string | null
          damage_severity: number | null
          estimated_scope: string | null
          geolocation: unknown
          id: string
          moisture_readings: Json | null
          notes: string | null
          organization_id: string
          photos: string[] | null
          project_id: string
          recommended_phases: string[] | null
          status: string | null
          tech_id: string
          updated_at: string | null
        }
        Insert: {
          affected_areas?: Json | null
          ai_damage_tags?: string[] | null
          ai_estimate?: number | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          damage_severity?: number | null
          estimated_scope?: string | null
          geolocation?: unknown
          id?: string
          moisture_readings?: Json | null
          notes?: string | null
          organization_id: string
          photos?: string[] | null
          project_id: string
          recommended_phases?: string[] | null
          status?: string | null
          tech_id: string
          updated_at?: string | null
        }
        Update: {
          affected_areas?: Json | null
          ai_damage_tags?: string[] | null
          ai_estimate?: number | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          damage_severity?: number | null
          estimated_scope?: string | null
          geolocation?: unknown
          id?: string
          moisture_readings?: Json | null
          notes?: string | null
          organization_id?: string
          photos?: string[] | null
          project_id?: string
          recommended_phases?: string[] | null
          status?: string | null
          tech_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recon_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reconstruction_phases: {
        Row: {
          actual_completion: string | null
          actual_cost: number | null
          assigned_subcontractor: string | null
          budget: number | null
          change_orders: Json | null
          created_at: string | null
          dependencies: string[] | null
          id: string
          notes: string | null
          organization_id: string
          permit_status: string | null
          permits_required: boolean | null
          phase_name: string
          photos: string[] | null
          pm_id: string
          project_id: string
          punch_list: Json | null
          start_date: string | null
          status: string | null
          target_completion: string | null
          updated_at: string | null
        }
        Insert: {
          actual_completion?: string | null
          actual_cost?: number | null
          assigned_subcontractor?: string | null
          budget?: number | null
          change_orders?: Json | null
          created_at?: string | null
          dependencies?: string[] | null
          id?: string
          notes?: string | null
          organization_id: string
          permit_status?: string | null
          permits_required?: boolean | null
          phase_name: string
          photos?: string[] | null
          pm_id: string
          project_id: string
          punch_list?: Json | null
          start_date?: string | null
          status?: string | null
          target_completion?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_completion?: string | null
          actual_cost?: number | null
          assigned_subcontractor?: string | null
          budget?: number | null
          change_orders?: Json | null
          created_at?: string | null
          dependencies?: string[] | null
          id?: string
          notes?: string | null
          organization_id?: string
          permit_status?: string | null
          permits_required?: boolean | null
          phase_name?: string
          photos?: string[] | null
          pm_id?: string
          project_id?: string
          punch_list?: Json | null
          start_date?: string | null
          status?: string | null
          target_completion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconstruction_phases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconstruction_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      task_lists: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          project_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          project_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_lists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          position: number
          priority: string
          status: string
          task_list_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          position?: number
          priority?: string
          status?: string
          task_list_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          position?: number
          priority?: string
          status?: string
          task_list_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_task_list_id_fkey"
            columns: ["task_list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable_hours: number | null
          clock_in: string
          clock_out: string | null
          created_at: string
          hourly_rate: number | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string
          total_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billable_hours?: number | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          project_id: string
          total_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billable_hours?: number | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      workflow_handoffs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          from_phase: string
          from_user: string
          handoff_data: Json | null
          id: string
          notes: string | null
          notification_sent: boolean | null
          organization_id: string
          project_id: string
          status: string | null
          to_phase: string
          to_user: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          from_phase: string
          from_user: string
          handoff_data?: Json | null
          id?: string
          notes?: string | null
          notification_sent?: boolean | null
          organization_id: string
          project_id: string
          status?: string | null
          to_phase: string
          to_user?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          from_phase?: string
          from_user?: string
          handoff_data?: Json | null
          id?: string
          notes?: string | null
          notification_sent?: boolean | null
          organization_id?: string
          project_id?: string
          status?: string | null
          to_phase?: string
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_handoffs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_handoffs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_project_number: { Args: never; Returns: string }
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
      has_any_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_organization_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      validate_portal_token: {
        Args: { token: string }
        Returns: {
          customer_name: string
          is_valid: boolean
          portal_id: string
          project_id: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "office_admin"
        | "recon_tech"
        | "mitigation_tech"
        | "contents_specialist"
        | "reconstruction_pm"
        | "field_crew"
        | "subcontractor"
      damage_type: "water" | "fire" | "mold" | "storm" | "biohazard" | "other"
      equipment_status: "available" | "deployed" | "maintenance" | "retired"
      equipment_type:
        | "dehumidifier"
        | "air_mover"
        | "air_scrubber"
        | "heater"
        | "generator"
        | "other"
      item_condition:
        | "excellent"
        | "good"
        | "fair"
        | "damaged"
        | "total_loss"
        | "salvage"
      job_type: "mitigation" | "contents" | "reconstruction"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      loss_type: "water" | "fire" | "mold" | "storm" | "other"
      project_stage:
        | "emergency"
        | "mitigation"
        | "estimating"
        | "reconstruction"
        | "contents"
        | "closeout"
      transaction_type:
        | "estimate"
        | "invoice"
        | "payment"
        | "change_order"
        | "expense"
      urgency_level: "low" | "medium" | "high" | "emergency"
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
      app_role: [
        "owner",
        "office_admin",
        "recon_tech",
        "mitigation_tech",
        "contents_specialist",
        "reconstruction_pm",
        "field_crew",
        "subcontractor",
      ],
      damage_type: ["water", "fire", "mold", "storm", "biohazard", "other"],
      equipment_status: ["available", "deployed", "maintenance", "retired"],
      equipment_type: [
        "dehumidifier",
        "air_mover",
        "air_scrubber",
        "heater",
        "generator",
        "other",
      ],
      item_condition: [
        "excellent",
        "good",
        "fair",
        "damaged",
        "total_loss",
        "salvage",
      ],
      job_type: ["mitigation", "contents", "reconstruction"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      loss_type: ["water", "fire", "mold", "storm", "other"],
      project_stage: [
        "emergency",
        "mitigation",
        "estimating",
        "reconstruction",
        "contents",
        "closeout",
      ],
      transaction_type: [
        "estimate",
        "invoice",
        "payment",
        "change_order",
        "expense",
      ],
      urgency_level: ["low", "medium", "high", "emergency"],
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
