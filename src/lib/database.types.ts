export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      charges: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          member_id: string | null
          month: number
          platform_id: string | null
          status: string | null
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          member_id?: string | null
          month: number
          platform_id?: string | null
          status?: string | null
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          member_id?: string | null
          month?: number
          platform_id?: string | null
          status?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "charges_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      member_subscriptions: {
        Row: {
          created_at: string
          id: string
          member_id: string
          platform_id: string
          rotation_order: number | null
          share_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          platform_id: string
          rotation_order?: number | null
          share_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          platform_id?: string
          rotation_order?: number | null
          share_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_subscriptions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount_paid: number
          charge_id: string | null
          created_at: string
          id: string
          method: string | null
          notes: string | null
          payment_date: string | null
        }
        Insert: {
          amount_paid: number
          charge_id?: string | null
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          payment_date?: string | null
        }
        Update: {
          amount_paid?: number
          charge_id?: string | null
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          payment_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charges"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          active_slots: number | null
          billing_cycle: string | null
          cost: number
          created_at: string
          icon_url: string | null
          id: string
          name: string
          payment_strategy: string | null
          total_slots: number | null
        }
        Insert: {
          active_slots?: number | null
          billing_cycle?: string | null
          cost: number
          created_at?: string
          icon_url?: string | null
          id?: string
          name: string
          payment_strategy?: string | null
          total_slots?: number | null
        }
        Update: {
          active_slots?: number | null
          billing_cycle?: string | null
          cost?: number
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          payment_strategy?: string | null
          total_slots?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}