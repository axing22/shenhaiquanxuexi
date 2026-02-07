import { Image } from "@/types/blocks/base";
import { Section as SectionType } from "@/types/blocks/section";

export interface VoiceActor {
  id: string;
  name: string;
  avatar: string;
  sampleAudio: string;
  language: string;
}

export interface TextToSpeech {
  name?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  maxCharacters?: number;
  languages?: string[];
  voiceActors?: VoiceActor[];
}

// 定义 Section 的类型
export interface TextToSpeechSection extends SectionType {
  // 基础属性
  input_placeholder: string;
  character_count: string;
  select_language: string;
  select_language_placeholder: string;
  generating: string;
  generate_voice: string;
  generation_history: string;
  no_history: string;
  pause: string;
  play: string;
  voice_file_prefix: string;
  history_title: string;
  select_voice: string;
  select_voice_button: string;

  // 语音等级标签
  voice_level: {
    free: string;
    premium: string;
    professional: string;
  };

  // 语音设置
  voice_settings: {
    title: string;
    speed: string;
    volume: string;
    pitch: string;
    speed_tip: string;
    volume_tip: string;
    pitch_tip: string;
  };

}