// src/app/models/preference-client.interface.ts
export interface PreferenceClient {
  id?: number;
  client_id?: number;
  climat: string;
  budget: string;
  typeVoyage_id: number;
  langueParlee: string;
  activite: string;
}

// src/app/models/destination.interface.ts
export interface Destination {
  id?: number;
  nom: string;
  pays?: string;
  description?: string;
  climat?: string;
  langueLocale?: string;
  activites?: string[];
  meilleurePeriode?: string;
   photo?: string; 
   prix?:number;
  created_at?: Date;
  updated_at?: Date;
}

// src/app/models/type-voyage.interface.ts
export interface TypeVoyage {
  id: number;
  libelle: string;
  description?: string;
}

// src/app/models/recommandation.interface.ts
export interface Recommandation {
  id?: number;
  client_id?: number;
  destination_id: number;
  destination?: Destination;
  score?: number;
}

// src/app/models/travel-recommendation.interface.ts (pour l'affichage)
export interface TravelRecommendation {
  id: number;
  destination: string;
  climat: string;
  pays: string;
  language: string;
  price: string;
  duration: string;
  rating: number;
  image_placeholder: string;
  description: string;
    image?: string; 
  highlights: string[];
  activites: string[];
  score: number; 
  matchPercentage: number;
}