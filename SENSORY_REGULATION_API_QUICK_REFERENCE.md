# Sensory Profile & Self-Regulation API - Quick Reference

## Sensory Profile Endpoints

### Base URL: `/api/v1/sensory`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/presets` | Get 6 preset profiles | ✅ |
| POST | `/profiles` | Create custom profile | ✅ |
| GET | `/profiles` | List user's profiles | ✅ |
| GET | `/profiles/{id}` | Get specific profile | ✅ |
| PATCH | `/profiles/{id}` | Update profile | ✅ |
| DELETE | `/profiles/{id}` | Delete profile | ✅ |
| POST | `/profiles/{id}/apply` | Set as active | ✅ |

## Self-Regulation Endpoints

### Base URL: `/api/v1/regulation`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/activities` | List all 13 activities | ✅ |
| POST | `/check-in` | Record emotion | ✅ |
| GET | `/learners/{id}/emotions` | Get emotion history | ✅ |
| POST | `/sessions` | Start activity session | ✅ |
| PATCH | `/sessions/{id}/complete` | Complete session | ✅ |
| GET | `/learners/{id}/sessions` | Get session history | ✅ |
| GET | `/recommendations/{emotion}` | Get recommendations | ✅ |

## Example Requests

### Create Sensory Profile (From Preset)
```bash
POST /api/v1/sensory/profiles
{
  "name": "My School Profile",
  "preset_id": "asd-low-sensory"
}
```

### Create Custom Sensory Profile
```bash
POST /api/v1/sensory/profiles
{
  "name": "My Custom Profile",
  "visual": {
    "reduce_animations": true,
    "font_size": "large",
    "font_family": "dyslexic",
    "line_spacing": "wide",
    "color_scheme": "warm",
    "flashing_content": "remove"
  },
  "auditory": {
    "sound_volume": 50,
    "text_to_speech_enabled": true,
    "text_to_speech_speed": 0.9,
    "text_to_speech_voice": "female"
  },
  "motor": {
    "larger_click_targets": true,
    "no_drag_and_drop": true,
    "hover_delay": 500
  },
  "cognitive": {
    "one_thing_at_a_time": true,
    "break_reminders": true,
    "break_frequency": 20,
    "limit_choices": 3,
    "time_multiplier": 1.5
  },
  "environment": {
    "full_screen_mode": true,
    "minimize_distractions": true,
    "hide_notifications": true
  }
}
```

### Emotion Check-In
```bash
POST /api/v1/regulation/check-in
{
  "learner_id": "uuid-here",
  "emotion": "anxious",
  "level": 4,
  "trigger": "Math test tomorrow",
  "context": "check_in"
}
```

### Start Regulation Session
```bash
POST /api/v1/regulation/sessions
{
  "learner_id": "uuid-here",
  "activity_id": "box-breathing",
  "emotion_before": {
    "emotion": "anxious",
    "level": 4,
    "trigger": "Feeling overwhelmed"
  }
}
```

### Complete Regulation Session
```bash
PATCH /api/v1/regulation/sessions/{session_id}/complete
{
  "emotion_after": {
    "emotion": "calm",
    "level": 2
  },
  "notes": "Box breathing really helped!"
}
```

## Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Emotion Types

- `calm`
- `happy`
- `sad`
- `angry`
- `frustrated`
- `anxious`
- `tired`
- `excited`

## Activity Types

- `breathing` - Controlled breathing exercises
- `movement` - Physical movement activities
- `sensory` - Sensory grounding techniques
- `grounding` - Mental grounding exercises
- `visualization` - Guided imagery

## Sensory Presets

1. **asd-low-sensory**: ASD Low Sensory
2. **adhd-focus**: ADHD Focus Mode
3. **dyslexia-friendly**: Dyslexia-Friendly
4. **vision-support**: Vision Support
5. **motor-support**: Motor Support
6. **anxiety-friendly**: Anxiety-Friendly

## Available Activities (13 total)

### Breathing (3)
- `box-breathing` - Box Breathing (4-4-4-4)
- `belly-breathing` - Belly Breathing
- `five-finger-breathing` - Five Finger Breathing

### Movement (3)
- `body-scan` - Body Scan
- `shake-it-out` - Shake It Out
- `wall-pushes` - Wall Pushes

### Sensory (3)
- `five-four-three-two-one` - 5-4-3-2-1 Grounding
- `cold-water-reset` - Cold Water Reset
- `quiet-corner` - Quiet Corner Time

### Grounding (2)
- `count-backwards` - Count Backwards
- `alphabet-game` - Alphabet Game

### Visualization (2)
- `safe-place` - Safe Place Visualization
- `balloon-worries` - Balloon Worries

## Caching

- Sensory profiles cached in Redis
- TTL: 5 minutes (300 seconds)
- Auto-invalidated on updates
- Cache key format: `sensory_profile:{profile_id}`

## Pagination

Endpoints with pagination support:
- `/regulation/learners/{id}/sessions`

Default: `page=1`, `page_size=20`

## Error Codes

- `404`: Resource not found or access denied
- `400`: Validation error or cannot delete last profile
- `401`: Unauthorized (missing/invalid token)
- `500`: Server error

## Rate Limiting

(To be configured per deployment)

## Best Practices

1. **Cache Profile Responses**: Frontend should cache active profile
2. **Batch Check-Ins**: Don't overload with too frequent emotion tracking
3. **Activity Instructions**: Display step-by-step for accessibility
4. **Recommendation Logic**: Show recommendations automatically when level >= 4
5. **Session Tracking**: Track duration client-side as backup
6. **Analytics Period**: Default 30 days, allow user customization

## Integration Notes

### Frontend Integration
- Store active sensory profile in app state
- Apply accommodations immediately on profile change
- Show activity instructions step-by-step
- Use progress indicators during sessions
- Celebrate completion with positive feedback

### Backend Integration
- All endpoints require JWT authentication
- User ID extracted from token (get_current_user)
- Learner ownership verified on all operations
- Database transactions ensure data consistency
- Redis handles profile caching automatically

## Testing Endpoints

Use Swagger UI at `/docs` or import OpenAPI schema into Postman/Insomnia.

Example curl command:
```bash
curl -X GET "http://localhost:8000/api/v1/sensory/presets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Support

For issues or questions:
- Check API documentation at `/docs`
- Review error messages in responses
- Verify authentication token is valid
- Ensure learner_id belongs to authenticated user
