# JellyFlix

A Netflix-inspired web client for your Jellyfin library. Browse the demo immediately, or connect to a Jellyfin server to see your movies and shows, search, save favorites, and play media.

## Run locally

Serve this directory with any static web server. For example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` and select the profile icon or “Explore demo library” to connect. Enter your Jellyfin server URL, username, and password. The server must be reachable from your browser and configured to allow cross-origin requests from the app's origin. When serving JellyFlix over HTTPS, your Jellyfin server must also use HTTPS.

The browser stores the Jellyfin access token and server address in local storage to keep you signed in. Disconnect using the profile menu to remove them. Passwords are sent directly to Jellyfin and are not stored by JellyFlix.

Playback starts with Jellyfin's direct stream endpoint and depends on browser support for the media format. Switching audio uses HLS and may require server-side transcoding; compatible video is copied when possible. HLS playback uses the bundled hls.js library (see vendor/HLS-LICENSE.txt). For a series, Play starts its first episode. The demo catalog is illustrative and requires a connected server for playback.
