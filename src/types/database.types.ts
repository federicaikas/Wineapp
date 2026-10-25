export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WineCategory = 'red' | 'white' | 'sparkling' | 'rose' | 'orange' | 'dessert';
export type DrinkingStatus = 'aging' | 'ready' | 'peak' | 'past';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          cellar_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          cellar_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          cellar_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      wines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          producer: string;
          vintage: number;
          country: string;
          region: string;
          appellation: string | null;
          sub_category: string | null;
          category: WineCategory;
          grapes: string[];
          alcohol: number | null;
          bottle_size: string | null;
          price: number | null;
          stock: number;
          favorite: boolean;
          location: string | null;
          purchase_channel: string | null;
          drinking_status: DrinkingStatus;
          drinking_window_start: number | null;
          drinking_window_end: number | null;
          drinking_window_peak: number | null;
          ai_calculated: boolean | null;
          ai_details: string | null;
          tasting_notes: Json | null;
          notes: string | null;
          image_url: string | null;
          embedding: string | null; // pgvector represented as string or float[]
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          producer: string;
          vintage: number;
          country: string;
          region: string;
          appellation?: string | null;
          sub_category?: string | null;
          category: WineCategory;
          grapes?: string[];
          alcohol?: number | null;
          bottle_size?: string | null;
          price?: number | null;
          stock?: number;
          favorite?: boolean;
          location?: string | null;
          purchase_channel?: string | null;
          drinking_status?: DrinkingStatus;
          drinking_window_start?: number | null;
          drinking_window_end?: number | null;
          drinking_window_peak?: number | null;
          ai_calculated?: boolean | null;
          ai_details?: string | null;
          tasting_notes?: Json | null;
          notes?: string | null;
          image_url?: string | null;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          producer?: string;
          vintage?: number;
          country?: string;
          region?: string;
          appellation?: string | null;
          sub_category?: string | null;
          category?: WineCategory;
          grapes?: string[];
          alcohol?: number | null;
          bottle_size?: string | null;
          price?: number | null;
          stock?: number;
          favorite?: boolean;
          location?: string | null;
          purchase_channel?: string | null;
          drinking_status?: DrinkingStatus;
          drinking_window_start?: number | null;
          drinking_window_end?: number | null;
          drinking_window_peak?: number | null;
          ai_calculated?: boolean | null;
          ai_details?: string | null;
          tasting_notes?: Json | null;
          notes?: string | null;
          image_url?: string | null;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wines_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      uncorked_history: {
        Row: {
          id: string;
          wine_id: string | null;
          user_id: string;
          uncorked_at: string;
          rating: number | null;
          occasion: string | null;
          pairing_notes: string | null;
        };
        Insert: {
          id?: string;
          wine_id?: string | null;
          user_id: string;
          uncorked_at?: string;
          rating?: number | null;
          occasion?: string | null;
          pairing_notes?: string | null;
        };
        Update: {
          id?: string;
          wine_id?: string | null;
          user_id?: string;
          uncorked_at?: string;
          rating?: number | null;
          occasion?: string | null;
          pairing_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "uncorked_history_wine_id_fkey";
            columns: ["wine_id"];
            isOneToOne: false;
            referencedRelation: "wines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "uncorked_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_wines: {
        Args: {
          query_embedding: string;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: {
          id: string;
          name: string;
          producer: string;
          vintage: number;
          category: WineCategory;
          region: string;
          stock: number;
          similarity: number;
        }[];
      };
    };
    Enums: {
      wine_category: WineCategory;
      drinking_status: DrinkingStatus;
    };
  };
}
