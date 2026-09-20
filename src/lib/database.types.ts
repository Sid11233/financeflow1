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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          actor_id: string | null
          actor_type: Database["public"]["Enums"]["activity_actor_type"]
          client_id: string | null
          created_at: string
          event_type: string
          id: string
          organization_id: string
          payload: Json
          request_id: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type: Database["public"]["Enums"]["activity_actor_type"]
          client_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          organization_id: string
          payload?: Json
          request_id?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["activity_actor_type"]
          client_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          organization_id?: string
          payload?: Json
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "activity_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_jobs: {
        Row: {
          attempts: number
          created_at: string
          document_id: string
          id: string
          last_error: string | null
          next_attempt_at: string
          organization_id: string
          processed_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          document_id: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string
          organization_id: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          document_id?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string
          organization_id?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "classification_queue_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "analytics_classification_outcomes"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "classification_queue_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_queue_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_settings: {
        Row: {
          auto_accept_confidence: number
          created_at: string
          model_name: string
          organization_id: string
          pdf_page_limit: number
          reassign_confidence: number
          updated_at: string
        }
        Insert: {
          auto_accept_confidence?: number
          created_at?: string
          model_name?: string
          organization_id: string
          pdf_page_limit?: number
          reassign_confidence?: number
          updated_at?: string
        }
        Update: {
          auto_accept_confidence?: number
          created_at?: string
          model_name?: string
          organization_id?: string
          pdf_page_limit?: number
          reassign_confidence?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_type_mappings: {
        Row: {
          ai_document_type: string
          created_at: string
          document_type_id: string
          organization_id: string
        }
        Insert: {
          ai_document_type: string
          created_at?: string
          document_type_id: string
          organization_id: string
        }
        Update: {
          ai_document_type?: string
          created_at?: string
          document_type_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classification_type_mappings_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classification_type_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_document_defaults: {
        Row: {
          client_id: string
          created_at: string
          document_type_id: string
          organization_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          document_type_id: string
          organization_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          document_type_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_document_defaults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_document_defaults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_document_defaults_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_document_defaults_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          email_bounce_type: string | null
          email_bounced_at: string | null
          id: string
          is_archived: boolean
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          email_bounce_type?: string | null
          email_bounced_at?: string | null
          id?: string
          is_archived?: boolean
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          email_bounce_type?: string | null
          email_bounced_at?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          name: string
          organization_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          organization_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          organization_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_classification: Json | null
          ai_confidence: number | null
          deleted_at: string | null
          id: string
          mime_type: string
          organization_id: string
          original_filename: string
          request_id: string
          required_document_id: string | null
          review_reason: string | null
          review_status: Database["public"]["Enums"]["document_review_status"]
          size_bytes: number
          storage_path: string
          uploaded_at: string
          uploader_ip: unknown
        }
        Insert: {
          ai_classification?: Json | null
          ai_confidence?: number | null
          deleted_at?: string | null
          id?: string
          mime_type: string
          organization_id: string
          original_filename: string
          request_id: string
          required_document_id?: string | null
          review_reason?: string | null
          review_status?: Database["public"]["Enums"]["document_review_status"]
          size_bytes: number
          storage_path: string
          uploaded_at?: string
          uploader_ip?: unknown
        }
        Update: {
          ai_classification?: Json | null
          ai_confidence?: number | null
          deleted_at?: string | null
          id?: string
          mime_type?: string
          organization_id?: string
          original_filename?: string
          request_id?: string
          required_document_id?: string | null
          review_reason?: string | null
          review_status?: Database["public"]["Enums"]["document_review_status"]
          size_bytes?: number
          storage_path?: string
          uploaded_at?: string
          uploader_ip?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_required_document_id_fkey"
            columns: ["required_document_id"]
            isOneToOne: false
            referencedRelation: "required_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          organization_id: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          error: string | null
          id: string
          organization_id: string
          recipient: string
          reminder_id: string | null
          request_id: string | null
          resend_message_id: string | null
          status: string
          subject: string
          template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          organization_id: string
          recipient: string
          reminder_id?: string | null
          request_id?: string | null
          resend_message_id?: string | null
          status?: string
          subject: string
          template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          organization_id?: string
          recipient?: string
          reminder_id?: string | null
          request_id?: string | null
          resend_message_id?: string | null
          status?: string
          subject?: string
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link_path: string | null
          organization_id: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link_path?: string | null
          organization_id: string
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link_path?: string | null
          organization_id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          default_deadline_day: number
          id: string
          logo_url: string | null
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          default_deadline_day?: number
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          default_deadline_day?: number
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      portal_rate_limit_events: {
        Row: {
          bucket_key: string
          created_at: string
          id: number
        }
        Insert: {
          bucket_key: string
          created_at?: string
          id?: never
        }
        Update: {
          bucket_key?: string
          created_at?: string
          id?: never
        }
        Relationships: []
      }
      product_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          organization_id: string
          payload: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          organization_id: string
          payload?: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          organization_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          digest_frequency: string
          full_name: string | null
          id: string
          is_staff: boolean
          last_digest_sent_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          digest_frequency?: string
          full_name?: string | null
          id: string
          is_staff?: boolean
          last_digest_sent_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          digest_frequency?: string
          full_name?: string | null
          id?: string
          is_staff?: boolean
          last_digest_sent_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_schedules: {
        Row: {
          created_at: string
          ladder: Json
          organization_id: string
          send_hour: number
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ladder?: Json
          organization_id: string
          send_hour?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ladder?: Json
          organization_id?: string
          send_hour?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          attempts: number
          audience: string
          channel: string
          created_at: string
          created_by: string | null
          id: string
          last_error: string | null
          organization_id: string
          reason: string | null
          request_id: string
          scheduled_for: string
          sent_at: string | null
          skipped_at: string | null
          status: string
          type: string
        }
        Insert: {
          attempts?: number
          audience?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_error?: string | null
          organization_id: string
          reason?: string | null
          request_id: string
          scheduled_for: string
          sent_at?: string | null
          skipped_at?: string | null
          status?: string
          type?: string
        }
        Update: {
          attempts?: number
          audience?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_error?: string | null
          organization_id?: string
          reason?: string | null
          request_id?: string
          scheduled_for?: string
          sent_at?: string | null
          skipped_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "reminders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_tokens: {
        Row: {
          access_count: number
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          organization_id: string
          request_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          access_count?: number
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          organization_id: string
          request_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          access_count?: number
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          organization_id?: string
          request_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tokens_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "request_tokens_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tokens_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          client_id: string
          client_submitted_at: string | null
          completed_at: string | null
          completion_percent: number
          created_at: string
          created_by: string
          deadline: string | null
          id: string
          organization_id: string
          period_label: string
          period_start: string
          reminder_ladder_override: Json | null
          reminders_paused_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          client_id: string
          client_submitted_at?: string | null
          completed_at?: string | null
          completion_percent?: number
          created_at?: string
          created_by: string
          deadline?: string | null
          id?: string
          organization_id: string
          period_label: string
          period_start: string
          reminder_ladder_override?: Json | null
          reminders_paused_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          client_id?: string
          client_submitted_at?: string | null
          completed_at?: string | null
          completion_percent?: number
          created_at?: string
          created_by?: string
          deadline?: string | null
          id?: string
          organization_id?: string
          period_label?: string
          period_start?: string
          reminder_ladder_override?: Json | null
          reminders_paused_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents: {
        Row: {
          created_at: string
          custom_name: string | null
          document_type_id: string | null
          id: string
          is_optional: boolean
          organization_id: string
          request_id: string
          sort_order: number
          status: Database["public"]["Enums"]["required_document_status"]
          waived_at: string | null
          waived_reason: string | null
        }
        Insert: {
          created_at?: string
          custom_name?: string | null
          document_type_id?: string | null
          id?: string
          is_optional?: boolean
          organization_id: string
          request_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["required_document_status"]
          waived_at?: string | null
          waived_reason?: string | null
        }
        Update: {
          created_at?: string
          custom_name?: string | null
          document_type_id?: string | null
          id?: string
          is_optional?: boolean
          organization_id?: string
          request_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["required_document_status"]
          waived_at?: string | null
          waived_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "required_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "required_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "required_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "required_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "required_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      analytics_classification_outcomes: {
        Row: {
          ai_confidence: number | null
          document_id: string | null
          organization_id: string | null
          organization_name: string | null
          review_reason: string | null
          review_status:
            | Database["public"]["Enums"]["document_review_status"]
            | null
          uploaded_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_reassignments: {
        Row: {
          confidence: number | null
          created_at: string | null
          from_label: string | null
          organization_id: string | null
          organization_name: string | null
          to_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_requests: {
        Row: {
          client_id: string | null
          client_name: string | null
          client_submitted_at: string | null
          completed_at: string | null
          completed_before_deadline: boolean | null
          days_to_complete: number | null
          deadline: string | null
          first_opened_at: string | null
          first_upload_at: string | null
          last_reminder_type_before_final_upload: string | null
          organization_id: string | null
          organization_name: string | null
          reminders_sent_count: number | null
          request_id: string | null
          sent_at: string | null
          sent_month: string | null
          status: Database["public"]["Enums"]["request_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_review_actions: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          created_at: string | null
          organization_id: string | null
          organization_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_overview: {
        Row: {
          active_request_count: number | null
          created_at: string | null
          email: string | null
          email_bounce_type: string | null
          email_bounced_at: string | null
          id: string | null
          is_archived: boolean | null
          last_request_period_label: string | null
          last_request_status:
            | Database["public"]["Enums"]["request_status"]
            | null
          name: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_overview: {
        Row: {
          ai_classification: Json | null
          ai_confidence: number | null
          client_id: string | null
          id: string | null
          mime_type: string | null
          organization_id: string | null
          original_filename: string | null
          period_label: string | null
          request_id: string | null
          required_document_id: string | null
          review_reason: string | null
          review_status:
            | Database["public"]["Enums"]["document_review_status"]
            | null
          size_bytes: number | null
          uploaded_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "analytics_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_required_document_id_fkey"
            columns: ["required_document_id"]
            isOneToOne: false
            referencedRelation: "required_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      request_overview: {
        Row: {
          client_id: string | null
          client_name: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          days_until_deadline: number | null
          deadline: string | null
          id: string | null
          last_reminder_sent_at: string | null
          missing_document_count: number | null
          missing_document_labels: string[] | null
          needs_review_count: number | null
          next_reminder_scheduled_for: string | null
          organization_id: string | null
          period_label: string | null
          period_start: string | null
          required_count: number | null
          resolved_count: number | null
          sent_at: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          status_rank: number | null
          waived_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_document: { Args: { p_document_id: string }; Returns: undefined }
      auth_is_owner: { Args: never; Returns: boolean }
      auth_is_staff: { Args: never; Returns: boolean }
      auth_org_id: { Args: never; Returns: string }
      cancel_request: { Args: { p_request_id: string }; Returns: undefined }
      check_and_record_rate_limit: {
        Args: {
          p_bucket_key: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      claim_classification_job: {
        Args: { p_job_id: string }
        Returns: {
          attempts: number
          created_at: string
          document_id: string
          id: string
          last_error: string | null
          next_attempt_at: string
          organization_id: string
          processed_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "classification_jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_due_reminders: {
        Args: { p_limit?: number }
        Returns: {
          attempts: number
          audience: string
          channel: string
          created_at: string
          created_by: string | null
          id: string
          last_error: string | null
          organization_id: string
          reason: string | null
          request_id: string
          scheduled_for: string
          sent_at: string | null
          skipped_at: string | null
          status: string
          type: string
        }[]
        SetofOptions: {
          from: "*"
          to: "reminders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      client_has_reminder_today: {
        Args: { p_client_id: string; p_organization_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_body?: string
          p_link_path?: string
          p_organization_id: string
          p_title: string
          p_type: string
          p_user_id?: string
        }
        Returns: string
      }
      create_request: {
        Args: {
          p_checklist: Json
          p_client_id: string
          p_deadline: string
          p_period_label: string
          p_period_start: string
          p_status: Database["public"]["Enums"]["request_status"]
          p_token_hash?: string
        }
        Returns: Json
      }
      extend_request_deadline: {
        Args: { p_new_deadline: string; p_request_id: string }
        Returns: undefined
      }
      find_due_classification_jobs: {
        Args: { p_limit?: number }
        Returns: string[]
      }
      list_org_members: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      log_activity: {
        Args: {
          p_actor_id?: string
          p_actor_type: Database["public"]["Enums"]["activity_actor_type"]
          p_client_id?: string
          p_event_type: string
          p_organization_id: string
          p_payload?: Json
          p_request_id?: string
        }
        Returns: string
      }
      mark_request_complete: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      materialize_reminder_ladder: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      push_back_pending_reminders: {
        Args: { p_min_gap?: string; p_request_id: string }
        Returns: undefined
      }
      reassign_document: {
        Args: { p_document_id: string; p_target_required_document_id: string }
        Returns: undefined
      }
      recompute_all_open_requests: { Args: never; Returns: undefined }
      recompute_request_status: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      record_token_access: { Args: { p_token_id: string }; Returns: boolean }
      reject_document: {
        Args: { p_document_id: string; p_reason?: string }
        Returns: undefined
      }
      revoke_tokens_for_finished_requests: { Args: never; Returns: undefined }
      set_reminder_skipped: {
        Args: { p_reminder_id: string; p_skipped: boolean }
        Returns: undefined
      }
      set_reminders_paused: {
        Args: { p_paused: boolean; p_request_id: string }
        Returns: undefined
      }
      waive_required_document: {
        Args: {
          p_document_id?: string
          p_reason?: string
          p_required_document_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_actor_type: "accountant" | "client" | "system"
      document_review_status:
        | "unreviewed"
        | "auto_accepted"
        | "confirmed"
        | "reassigned"
        | "rejected"
      request_status:
        | "draft"
        | "sent"
        | "partial"
        | "complete"
        | "overdue"
        | "cancelled"
      required_document_status:
        | "pending"
        | "received"
        | "needs_review"
        | "accepted"
        | "rejected"
        | "waived"
      user_role: "owner" | "member"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_actor_type: ["accountant", "client", "system"],
      document_review_status: [
        "unreviewed",
        "auto_accepted",
        "confirmed",
        "reassigned",
        "rejected",
      ],
      request_status: [
        "draft",
        "sent",
        "partial",
        "complete",
        "overdue",
        "cancelled",
      ],
      required_document_status: [
        "pending",
        "received",
        "needs_review",
        "accepted",
        "rejected",
        "waived",
      ],
      user_role: ["owner", "member"],
    },
  },
} as const
