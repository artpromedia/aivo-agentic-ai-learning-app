import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SensoryProfile } from '@/types/sensory'

// Mock component for testing sensory profiles
function SensoryProfileDisplay({ profile }: { profile: SensoryProfile }) {
  return (
    <div data-testid="sensory-profile">
      <h2>{profile.name}</h2>
      <div data-testid="preset-id">{profile.preset_id}</div>
      
      {/* Visual settings */}
      {profile.visual.dark_mode && (
        <div data-testid="dark-mode">Dark Mode Enabled</div>
      )}
      {profile.visual.font_family && (
        <div data-testid="font-family">{profile.visual.font_family}</div>
      )}
      
      {/* Auditory settings */}
      {profile.auditory.mute_all_sounds && (
        <div data-testid="muted">Sound Muted</div>
      )}
      
      {/* Cognitive settings */}
      {profile.cognitive.one_thing_at_a_time && (
        <div data-testid="focus-mode">One Thing at a Time</div>
      )}
      
      <div data-testid="time-multiplier">
        {profile.cognitive.time_multiplier}x time
      </div>
    </div>
  )
}

describe('SensoryProfile Component', () => {
  it('renders Jayden ADHD focus profile correctly', () => {
    const jaydenProfile: SensoryProfile = {
      user_id: 1,
      name: "Jayden's Focus Mode",
      preset_id: 'adhd-focus',
      visual: {
        reduce_animations: true,
        reduce_motion: true,
        high_contrast: true,
        dark_mode: false,
        reduced_clutter: true,
        font_size: 'large',
        font_family: 'dyslexic',
        line_spacing: 'extra-wide',
        color_scheme: 'warm',
        flashing_content: 'remove',
      },
      auditory: {
        mute_all_sounds: false,
        sound_volume: 50,
        no_background_music: true,
        no_sound_effects: false,
        text_to_speech_enabled: true,
        text_to_speech_speed: 0.9,
        text_to_speech_voice: 'female',
        audio_descriptions: false,
      },
      motor: {
        larger_click_targets: true,
        no_double_click: false,
        no_drag_and_drop: false,
        increase_spacing: true,
        sticky_keys: false,
        keyboard_only: false,
        touch_accommodations: false,
        hover_delay: 200,
      },
      cognitive: {
        one_thing_at_a_time: true,
        no_popups: true,
        no_autoplay: true,
        simplify_instructions: true,
        show_progress_indicator: true,
        limit_choices: 3,
        extended_time: true,
        time_multiplier: 1.5,
        break_reminders: true,
        break_frequency: 20,
      },
      environment: {
        full_screen_mode: true,
        minimize_distractions: true,
        hide_chat: false,
        hide_notifications: true,
        white_noise: false,
      },
    }

    render(<SensoryProfileDisplay profile={jaydenProfile} />)

    expect(screen.getByText("Jayden's Focus Mode")).toBeTruthy()
    expect(screen.getByTestId('preset-id')).toHaveTextContent('adhd-focus')
    expect(screen.getByTestId('font-family')).toHaveTextContent('dyslexic')
    expect(screen.getByTestId('focus-mode')).toHaveTextContent(
      'One Thing at a Time'
    )
    expect(screen.getByTestId('time-multiplier')).toHaveTextContent('1.5x time')
    expect(screen.queryByTestId('muted')).not.toBeTruthy()
  })

  it('renders Jason ASD low sensory profile correctly', () => {
    const jasonProfile: SensoryProfile = {
      user_id: 1,
      name: "Jason's Calm Space",
      preset_id: 'asd-low-sensory',
      visual: {
        reduce_animations: true,
        reduce_motion: true,
        high_contrast: false,
        dark_mode: true,
        reduced_clutter: true,
        font_size: 'medium',
        font_family: 'standard',
        line_spacing: 'wide',
        color_scheme: 'cool',
        flashing_content: 'remove',
      },
      auditory: {
        mute_all_sounds: true,
        sound_volume: 0,
        no_background_music: true,
        no_sound_effects: true,
        text_to_speech_enabled: false,
        text_to_speech_speed: 1.0,
        text_to_speech_voice: 'male',
        audio_descriptions: false,
      },
      motor: {
        larger_click_targets: true,
        no_double_click: true,
        no_drag_and_drop: true,
        increase_spacing: true,
        sticky_keys: false,
        keyboard_only: true,
        touch_accommodations: true,
        hover_delay: 500,
      },
      cognitive: {
        one_thing_at_a_time: true,
        no_popups: true,
        no_autoplay: true,
        simplify_instructions: false,
        show_progress_indicator: true,
        limit_choices: 0,
        extended_time: true,
        time_multiplier: 2.0,
        break_reminders: true,
        break_frequency: 30,
      },
      environment: {
        full_screen_mode: true,
        minimize_distractions: true,
        hide_chat: true,
        hide_notifications: true,
        white_noise: false,
      },
      triggers: {
        avoid_colors: ['#ff0000', '#ff6600'],
        avoid_patterns: true,
        avoid_flashing: true,
        content_warnings: ['loud-noises', 'sudden-changes'],
      },
    }

    render(<SensoryProfileDisplay profile={jasonProfile} />)

    expect(screen.getByText("Jason's Calm Space")).toBeTruthy()
    expect(screen.getByTestId('preset-id')).toHaveTextContent(
      'asd-low-sensory'
    )
    expect(screen.getByTestId('dark-mode')).toHaveTextContent(
      'Dark Mode Enabled'
    )
    expect(screen.getByTestId('muted')).toHaveTextContent('Sound Muted')
    expect(screen.getByTestId('focus-mode')).toHaveTextContent(
      'One Thing at a Time'
    )
    expect(screen.getByTestId('time-multiplier')).toHaveTextContent('2x time')
  })

  it('applies correct accessibility features for ADHD', () => {
    const profile: SensoryProfile = {
      user_id: 1,
      name: 'ADHD Profile',
      preset_id: 'adhd-focus',
      visual: {
        font_family: 'dyslexic',
        line_spacing: 'extra-wide',
        reduced_clutter: true,
      },
      cognitive: {
        one_thing_at_a_time: true,
        break_reminders: true,
        break_frequency: 20,
        time_multiplier: 1.5,
      },
    } as SensoryProfile

    render(<SensoryProfileDisplay profile={profile} />)

    expect(screen.getByTestId('font-family')).toHaveTextContent('dyslexic')
    expect(screen.getByTestId('time-multiplier')).toHaveTextContent('1.5x time')
  })

  it('applies correct accessibility features for ASD', () => {
    const profile: SensoryProfile = {
      user_id: 1,
      name: 'ASD Profile',
      preset_id: 'asd-low-sensory',
      visual: {
        dark_mode: true,
        reduced_clutter: true,
      },
      auditory: {
        mute_all_sounds: true,
        sound_volume: 0,
      },
      cognitive: {
        one_thing_at_a_time: true,
        time_multiplier: 2.0,
      },
    } as SensoryProfile

    render(<SensoryProfileDisplay profile={profile} />)

    expect(screen.getByTestId('dark-mode')).toBeTruthy()
    expect(screen.getByTestId('muted')).toBeTruthy()
    expect(screen.getByTestId('time-multiplier')).toHaveTextContent('2x time')
  })
})
