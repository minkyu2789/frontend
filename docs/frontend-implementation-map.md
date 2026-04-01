# Frontend Implementation Map

## Scope and Sources

- Frontend source: `src/navigation/screens/*`
- Backend API source: `../backend/src/main/kotlin/semo/backend/controller/*`
- Design source: `../figma.pdf` (25 pages)

## Note on Figma Parsing in This Environment

- `pdftotext`/`pdfinfo`/OCR binaries are not installed in this workspace.
- I could not reliably extract textual labels from `figma.pdf` via CLI.
- Screen names and flow below are based on current frontend routes and should be visually validated against Figma page-by-page during implementation.

## Current Frontend Screen Inventory

- `MainScreen` (tab: 홈)
- `Chats` (tab: 채팅)
- `MyPage` (tab: 나의 여행)
- `BookMark` (tab: 저장)
- `Nearby` (stack)
- `QuickMatch` (stack)
- `NotFound` (stack fallback)

## Screen -> API Mapping

### MainScreen

- Primary purpose: show city context + nearby mingler/quick actions + trending places.
- Backend APIs:
- `GET /nationalities`
- `GET /cities/nationalities/{nationalityId}`
- `GET /restaurants/cities/{cityId}`
- `GET /restaurants/{restaurantId}/images`
- `GET /cafes/cities/{cityId}`
- `GET /cafes/{cafeId}/images`
- Optional interaction APIs:
- `POST /saved-restaurants` (save restaurant)
- `POST /saved-cafes` (save cafe)

### QuickMatch

- Primary purpose: create/search/accept/decline quick match.
- Backend APIs:
- `POST /quick-matches` body `{ cityId, message?, targetType }`
- `GET /quick-matches?cityId=&targetType=`
- `POST /quick-matches/{quickMatchId}/accept`
- `POST /quick-matches/{quickMatchId}/decline`

### Nearby

- Primary purpose: browse mingle posts and participants.
- Backend APIs:
- `GET /mingles?cityId=`
- `GET /mingles/{mingleId}`
- `GET /mingles/{mingleId}/minglers`
- `POST /mingles/{mingleId}/minglers`
- `DELETE /mingles/{mingleId}/minglers/me`

### Chats

- Primary purpose: chat room list + chat thread.
- Backend APIs:
- `GET /chatrooms`
- `GET /chatrooms/{chatRoomId}`
- `GET /chatrooms/{chatRoomId}/messages`
- `POST /chatrooms` (direct chat init)
- `POST /chatrooms/mingles/{mingleId}/join`
- Real-time (when enabled): STOMP over `/ws-chat` with `accessToken` header.

### BookMark

- Primary purpose: saved places list, unsave action.
- Backend APIs:
- `GET /saved-restaurants`
- `GET /saved-cafes`
- `DELETE /saved-restaurants/{savedRestaurantId}`
- `DELETE /saved-cafes/{savedCafeId}`

### MyPage

- Primary purpose: user profile + trip history.
- Backend APIs:
- `GET /users/{userId}` (current user id to be resolved from auth context)
- `PUT /users/{userId}`
- `GET /trips`
- `POST /trips`
- `PUT /trips/{tripId}`
- `DELETE /trips/{tripId}`

## Auth and Header Rules

- Login endpoint: `POST /auth/login` body `{ username, password }`
- Login response: `{ accessToken: string }`
- Authenticated API calls must include header: `accessToken: <token>`
- No `Bearer` prefix is used by backend filter.

## Implementation Order (Execution)

1. Auth bootstrap
- Add login screen or temporary developer login action.
- Persist `accessToken` in frontend state/store.

2. QuickMatch vertical slice
- Wire `QuickMatch` screen to create + poll/list + accept/decline.
- Add loading/empty/error/retry states.

3. Bookmark vertical slice
- Replace static bookmark UI with saved restaurants/cafes APIs.

4. MyPage vertical slice
- Connect profile + trips APIs and replace hardcoded travel cards.

5. Chats vertical slice
- Render chat room list and room messages (read-only first, send later).

6. MainScreen & Nearby polish
- Replace mock cards with city/place/mingle data.
- Match spacing/typography/interaction details against Figma.

## Data Contracts to Add Next

- Frontend typed models for: `User`, `Trip`, `QuickMatch`, `Mingle`, `ChatRoom`, `ChatMessage`, `SavedRestaurant`, `SavedCafe`, `Restaurant`, `Cafe`, `PlaceImage`.
- Mapper layer from backend DTO shape to UI card/view model shape.

## Validation Checklist

- Every data-driven screen has explicit loading/empty/error states.
- Every save/join/accept action has optimistic or immediate UI feedback.
- Auth header present on protected endpoints.
- Quick match and mingle joins are tested with at least two users.
- Visual parity check against each relevant page in `figma.pdf`.
- Pixel parity pass before merge: exact sizing, typography, spacing, radius, and layout alignment against Figma reference.
