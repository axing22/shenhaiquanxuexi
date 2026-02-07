import { Image, Button } from "@/types/blocks/base";

export interface SectionItem {
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  url?: string;
  target?: string;
  children?: SectionItem[];
}

export interface Section {
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  items?: SectionItem[];
  input_placeholder?: String, 
  character_count?: Number, 
  select_language?: String,
  select_language_placeholder?: String, 
  generating?: Boolean, 
  generate_voice?: String, 
  generation_history?: String[],
}
