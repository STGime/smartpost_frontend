# SmartPost Frontend Implementation Plan

## Overview

This document outlines the implementation plan for the SmartPost frontend, a multi-platform social media posting tool.

## Platform Support Status

### Fully Configured Platforms
| Platform | OAuth | Publishing | Carousel/Thread | Status |
|----------|-------|------------|-----------------|--------|
| TikTok | Yes | Yes | No | Active |
| Instagram | Yes | Yes | Yes (up to 10) | Active |
| Facebook | Yes | Yes | Yes | Active |
| YouTube | Yes | Yes | No | Active |
| Pinterest | Yes | Yes | Yes | Active |
| Threads | Yes | Yes | Yes | Active |

### New Platform Configurations (Updated Dec 2024)

#### LinkedIn
- **OAuth**: Yes (OAuth 2.0)
- **Publishing**: Yes
- **Carousel Support**: Yes (via PDF documents)
- **Configuration Options**:
  - `visibility`: 'PUBLIC' | 'CONNECTIONS'
  - `postType`: 'post' | 'document' | 'article'
  - `documentTitle`: Title for carousel/PDF posts
  - `articleTitle`: Title for article posts
  - `articleUrl`: URL for article link posts
  - `shareCommentary`: Commentary when sharing

**LinkedIn Carousel Implementation Notes**:
- Carousels are actually PDF documents (up to 300 pages, 100MB max)
- To create a carousel:
  1. Upload a multi-page PDF as media
  2. Set `postType: 'document'`
  3. Set `documentTitle` for the carousel title

#### X (Twitter)
- **OAuth**: Yes (OAuth 2.0 with PKCE)
- **Publishing**: Yes
- **Thread Support**: Yes
- **Configuration Options**:
  - `threadMode`: Enable thread posting
  - `threadSeparator`: Split caption into thread (default: '\n\n')
  - `altText`: Array of alt text for images (up to 4)
  - `replySettings`: 'everyone' | 'following' | 'mentionedUsers'
  - `quoteTweetId`: ID of tweet to quote

**X Thread Implementation Notes**:
- 280 character limit (25,000 for Premium)
- Up to 4 images or 1 video per tweet
- Alt text up to 1000 characters per image

#### Bluesky
- **Auth**: App Password (not OAuth)
- **Publishing**: Yes
- **Thread Support**: Yes
- **Configuration Options**:
  - `threadMode`: Enable thread posting
  - `threadSeparator`: Split caption into thread
  - `altText`: Array of alt text for images (up to 4)
  - `embedUrl`: URL to embed as link card
  - `languages`: ISO language codes (e.g., ['en'])
  - `labels`: Content warnings ('nsfw', 'nudity', 'suggestive', 'gore', 'spoiler')

**Bluesky Implementation Notes**:
- 300 character limit per post
- Up to 4 images per post
- No video support yet
- Alt text up to 2000 characters

---

## Frontend Implementation Tasks

### Phase 1: Platform Configuration UI Components (COMPLETED)

All 9 platforms now have configuration panels:

#### 1.1 TikTok Configuration Panel
- [x] Create `TikTokConfigPanel.vue` component
- [x] Video title input
- [x] Publish/Draft mode toggle
- [x] AI-generated content disclosure
- [x] Engagement settings (comments, duet, stitch)
- [x] Brand content toggles

#### 1.2 Instagram Configuration Panel
- [x] Create `InstagramConfigPanel.vue` component
- [x] Placement selector (Feed/Reels/Story)
- [x] Custom caption override

#### 1.3 YouTube Configuration Panel
- [x] Create `YouTubeConfigPanel.vue` component
- [x] Video/Short toggle
- [x] Title and description inputs
- [x] Tags input with add/remove
- [x] Privacy settings (public/unlisted/private)
- [x] Category selector
- [x] Made for Kids toggle
- [x] Notify subscribers option

#### 1.4 Facebook Configuration Panel
- [x] Create `FacebookConfigPanel.vue` component
- [x] Placement selector (Feed/Reels/Story)
- [x] Custom caption override

#### 1.5 X (Twitter) Configuration Panel
- [x] Create `XConfigPanel.vue` component
- [x] Thread mode toggle with live preview
- [x] Thread separator customization
- [x] Alt text inputs for images (max 4)
- [x] Reply settings selector
- [x] Quote tweet ID input
- [x] Character counter (280/25k)

#### 1.6 LinkedIn Configuration Panel
- [x] Create `LinkedInConfigPanel.vue` component
- [x] Post type selector (post/document/article)
- [x] Visibility toggle (PUBLIC/CONNECTIONS)
- [x] Document title input (for carousel posts)
- [x] Article URL input (for article shares)

#### 1.7 Pinterest Configuration Panel
- [x] Create `PinterestConfigPanel.vue` component
- [x] Pin title input
- [x] Destination link input
- [x] Alt text for accessibility
- [x] Pin description override

#### 1.8 Bluesky Configuration Panel
- [x] Create `BlueskyConfigPanel.vue` component
- [x] Thread mode toggle with preview
- [x] Alt text inputs for images
- [x] Language selector (up to 3)
- [x] Content label selector (content warnings)
- [x] Embed URL input
- [x] Character counter (300 limit)

#### 1.9 Threads Configuration Panel
- [x] Create `ThreadsConfigPanel.vue` component
- [x] Location selector (Timeline/Reels)
- [x] Custom caption override

### Phase 2: Post Creation Enhancements

#### 2.1 Platform-Specific Settings Modal
- [ ] Create expandable platform settings sections
- [ ] Show settings only for selected platforms
- [ ] Real-time validation against platform limits
- [ ] Preview how post will look on each platform

#### 2.2 Media Upload Enhancements
- [ ] Support PDF upload for LinkedIn carousels
- [ ] Show carousel preview for multi-page PDFs
- [ ] Add alt text editor for images
- [ ] Platform compatibility indicators

#### 2.3 Thread Composer
- [ ] Thread preview for X and Bluesky
- [ ] Auto-split long text into thread parts
- [ ] Manual thread part editor
- [ ] Character count per part

### Phase 3: Account Management

#### 3.1 LinkedIn Account Setup
- [ ] OAuth flow integration
- [ ] Show connected company pages
- [ ] Display connection status

#### 3.2 X Account Setup
- [ ] OAuth 2.0 with PKCE flow
- [ ] Display connection status
- [ ] Show Premium status if applicable

#### 3.3 Bluesky Account Setup
- [ ] App password input form
- [ ] Handle validation
- [ ] Display connection status

### Phase 4: Publishing & Results

#### 4.1 Publishing Status
- [ ] Show per-platform publishing progress
- [ ] Display platform-specific errors
- [ ] Link to published posts

#### 4.2 Post Analytics (Future)
- [ ] Display engagement metrics
- [ ] Platform comparison views

---

## Type Definitions (Updated)

The following types have been added/updated in `src/types/index.ts`:

```typescript
// LinkedIn configuration
export interface LinkedInConfiguration extends BasePlatformConfiguration {
  visibility?: 'PUBLIC' | 'CONNECTIONS'
  postType?: 'post' | 'document' | 'article'
  documentTitle?: string
  articleTitle?: string
  articleUrl?: string
  shareCommentary?: string
}

// X (Twitter) configuration
export interface XConfiguration extends BasePlatformConfiguration {
  threadMode?: boolean
  threadSeparator?: string
  altText?: string[]
  replySettings?: 'everyone' | 'following' | 'mentionedUsers'
  quoteTweetId?: string
}

// Bluesky configuration
export interface BlueskyConfiguration extends BasePlatformConfiguration {
  threadMode?: boolean
  threadSeparator?: string
  altText?: string[]
  embedUrl?: string
  languages?: string[]
  labels?: ('nsfw' | 'nudity' | 'suggestive' | 'gore' | 'spoiler')[]
}
```

---

## API Endpoints Reference

### Platform Specifications
- `GET /v1/platforms` - List all platforms
- `GET /v1/platforms/{platformId}` - Get platform details
- `GET /v1/platforms/specifications` - Get all platform specs

### Social Accounts
- `POST /v1/social-accounts/oauth/initiate` - Start OAuth flow
- `POST /v1/social-accounts/bluesky/connect` - Connect Bluesky (app password)

### Posts
- `POST /v1/posts` - Create post with platform configurations
- `PATCH /v1/posts/{id}` - Update post
- `POST /v1/posts/{id}/publish` - Publish post

---

## Component Structure

```
src/
├── components/
│   ├── platform/
│   │   ├── LinkedInConfigPanel.vue
│   │   ├── XConfigPanel.vue
│   │   ├── BlueskyConfigPanel.vue
│   │   ├── TikTokConfigPanel.vue
│   │   ├── InstagramConfigPanel.vue
│   │   ├── FacebookConfigPanel.vue
│   │   ├── YouTubeConfigPanel.vue
│   │   ├── PinterestConfigPanel.vue
│   │   └── ThreadsConfigPanel.vue
│   ├── post/
│   │   ├── ThreadComposer.vue
│   │   ├── CarouselUploader.vue
│   │   └── AltTextEditor.vue
│   └── common/
│       ├── CharacterCounter.vue
│       └── PlatformBadge.vue
├── views/
│   └── posts/
│       └── CreatePostView.vue
└── types/
    └── index.ts
```

---

## Notes

- LinkedIn carousels require PDF upload (multi-page PDF = carousel slides)
- X thread mode auto-splits text at double newlines by default
- Bluesky requires app passwords, not OAuth
- Alt text is highly recommended for accessibility on all platforms
- Content labels on Bluesky are for content warnings (NSFW, spoilers, etc.)
