/**
 * Sensory Profile Types
 * Defines accommodation settings for neurodiverse learners
 */

export interface VisualSettings {
  reduce_animations?: boolean
  reduce_motion?: boolean
  high_contrast?: boolean
  dark_mode?: boolean
  reduced_clutter?: boolean
  font_size?: string
  font_family?: string
  line_spacing?: string
  color_scheme?: string
  flashing_content?: string
}

export interface AuditorySettings {
  mute_all_sounds?: boolean
  sound_volume?: number
  no_background_music?: boolean
  no_sound_effects?: boolean
  text_to_speech_enabled?: boolean
  text_to_speech_speed?: number
  text_to_speech_voice?: string
  audio_descriptions?: boolean
}

export interface MotorSettings {
  larger_click_targets?: boolean
  no_double_click?: boolean
  no_drag_and_drop?: boolean
  increase_spacing?: boolean
  sticky_keys?: boolean
  keyboard_only?: boolean
  touch_accommodations?: boolean
  hover_delay?: number
}

export interface CognitiveSettings {
  one_thing_at_a_time?: boolean
  no_popups?: boolean
  no_autoplay?: boolean
  simplify_instructions?: boolean
  show_progress_indicator?: boolean
  limit_choices?: number
  extended_time?: boolean
  time_multiplier?: number
  break_reminders?: boolean
  break_frequency?: number
}

export interface EnvironmentSettings {
  full_screen_mode?: boolean
  minimize_distractions?: boolean
  hide_chat?: boolean
  hide_notifications?: boolean
  white_noise?: boolean
}

export interface TriggerSettings {
  avoid_colors?: string[]
  avoid_patterns?: boolean
  avoid_flashing?: boolean
  content_warnings?: string[]
}

export interface SensoryProfile {
  user_id: number
  name: string
  preset_id: string
  visual: VisualSettings
  auditory?: AuditorySettings
  motor?: MotorSettings
  cognitive?: CognitiveSettings
  environment?: EnvironmentSettings
  triggers?: TriggerSettings
}
