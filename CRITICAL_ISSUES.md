# CRITICAL ISSUES TO FIX

## Phase 1: Audio Streaming Issues
- [ ] Audio not functioning - no sound coming through radio player
- [ ] Web Audio API connection broken or not initialized
- [ ] Audio source URLs not loading or playing
- [ ] Volume control not working
- [ ] Check browser console for audio errors
- [ ] Verify audio context is created and started
- [ ] Test with different audio sources

## Phase 2: Home Page Navigation Issues  
- [ ] Home page buttons don't work/not functional
- [ ] Navigation between tabs not working
- [ ] Button click handlers not firing
- [ ] Router navigation broken
- [ ] Check for JavaScript errors in console
- [ ] Verify wouter router is properly configured
- [ ] Test button click event listeners

## Phase 3: Podcast/Track Display Issues
- [ ] Podcast info not displaying
- [ ] Track metadata not showing
- [ ] Song title/artist not visible
- [ ] Duration/progress not showing
- [ ] Album art not displaying
- [ ] Check API endpoints for metadata
- [ ] Verify data is being fetched correctly

## Phase 4: RRB Site Integration Issues
- [ ] RRB site embedded in Qumus dashboard
- [ ] Clicking RRB pulls up the site
- [ ] Site is forcing login redirect
- [ ] After login, redirects to Qumus Home Screen
- [ ] Check iframe integration
- [ ] Verify authentication flow
- [ ] Fix redirect loop

## Phase 5: Login Redirect Issues
- [ ] Login redirects to Qumus Home Screen instead of intended page
- [ ] Redirect URL not being preserved
- [ ] Session/auth state not maintained
- [ ] Check OAuth callback handling
- [ ] Verify redirect_uri parameter
- [ ] Fix post-login navigation

## Expected Behavior (from knowledge base)
- Audio should auto-play 'Rockin Rockin Boogie' on entry with low volume
- Default frequency should be 432Hz
- Podcasts should be video-integrated with dedicated viewing screen
- Interactive elements should work on mobile
- Bot AI assistance should be active in podcast screen
- Call-in feature for live feedback
- No alarm sounds on HybridCast app open
- All audio should sound human/realistic, not AI-generated

## Root Cause Analysis Needed
1. Is Web Audio API initialized?
2. Are audio sources accessible?
3. Is CORS configured correctly?
4. Are routes properly defined?
5. Is authentication flow correct?
6. Is iframe integration secure?
