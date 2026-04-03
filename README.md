# frontend

React Native (Expo) client for Semo.

## Current Product Snapshot

- Bottom tabs: Home / Chats / History / Saved.
- Home:
- traveler/local mode toggle,
- traveler mode: place chips (restaurants/cafes),
- local mode: live mingle map.
- Nearby:
- mingle list + map,
- create mingle with place/date/time/target count.
- Chat:
- room unread badges,
- translated/original message rendering support in chat screen.
- My Page:
- trip cards with city representative backgrounds and companion avatars.

## Localization Rule (Required)

- All Korean UI text must be fully translatable to English.
- Use locale-aware rendering for static strings (`tx(korean, english)`).
- Use English-capable DB fields for dynamic labels where available.
- Ensure English text fits UI without clipping or structural regressions.

## Working Agreement

1. Match finalized Figma views exactly.
2. Keep backend API contract as integration truth.
3. Keep loading/empty/error states explicit and clean.
4. Update AGENTS/README notes after major behavior changes.
