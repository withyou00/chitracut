# 🎬 ChitraCut – Free Video Editor (Browser + Phone App)

CapCut ತರಹದ video editor. ಯಾವುದೇ server ಬೇಕಿಲ್ಲ — ಎಲ್ಲಾ editing ನಿಮ್ಮ phone/PC ಯ browser ನಲ್ಲೇ ಆಗುತ್ತದೆ.
GitHub Pages ನಲ್ಲಿ **ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿ** host ಮಾಡಬಹುದು ಮತ್ತು phone ನಲ್ಲಿ app ಆಗಿ install ಮಾಡಬಹುದು (PWA).

## ✅ Features (Phase 1 + 2 + 3)
| ವಿಭಾಗ | Features |
|---|---|
| Timeline | Multi-clip, trim (clip ಅಂಚು drag), split (S), delete, duplicate, move, undo/redo, zoom |
| Video | Scale, position, rotate, Fit/Fill, aspect ratio 9:16 / 16:9 / 1:1 / 4:5 …, blur background |
| Animation | In / Out (Fade, Zoom, Slide, Spin, Shake) + Combo (Ken Burns, Pulse, Sway) |
| Speed | 0.1x–10x + **Speed curves** (Montage, Hero, Bullet, Jump Cut, Flash In/Out, Custom) |
| Filters | 12 filters (Vivid, Warm, Cinematic, B&W, Vintage…) + strength |
| Adjust | Brightness, contrast, saturation, temperature, tint, fade, vignette, grain, sharpen |
| LUT | 7 built-in LUTs + ನಿಮ್ಮ **.cube LUT import** |
| Audio | Volume, fade in/out, **Bass boost, Treble**, **Mic Hog**, Megaphone, Telephone, Robot, Lo-Fi, Deep, Radio, **Echo, Reverb**, background music |
| Text (Phase 2) | ಕನ್ನಡ fonts (Noto Sans/Serif Kannada, Baloo Tamma 2, Anek, Tiro) + 9 English fonts, 8 style presets, color, outline, background box, shadow/glow, bold/italic, align |
| Text animation | In/Out: Fade, Pop, Zoom, Slide, **Typewriter** (ಕನ್ನಡ ಅಕ್ಷರ ಒಡೆಯದೆ), Bounce, Spin, Blur · Loop: Pulse, Shake, Float, Swing, Blink, Heartbeat |
| Stickers / Overlay | 48 emoji stickers, PNG logo/watermark overlay, layer order |
| Photos | Photo ಗಳನ್ನು timeline clip ಆಗಿ (3s default, trim ಮಾಡಬಹುದು) |
| Transitions | Dissolve, Fade Black, Flash White, Slide ×4, Wipe ×2, Zoom In/Out, Spin, Glitch (clip ಗಳ ನಡುವಿನ ⇄ ಒತ್ತಿ) — audio crossfade ಸಹಿತ |
| Preview editing | Preview ನಲ್ಲೇ text/sticker/video drag, mouse wheel ಅಥವಾ pinch ಮಾಡಿ size |
| PiP / Multi-layer (Phase 3) | Video ಮೇಲೆ video/photo (🎞 PiP), layer order, speed, volume, main track ಮುಗಿದ ನಂತರವೂ overlay play |
| Keyframes | Position, size, rotate, opacity — main clip, PiP, text, sticker ಎಲ್ಲಕ್ಕೂ (◆ / `K`) |
| Mask | Linear, Mirror, Circle, Rectangle (round corners), Heart, Star + feather, invert, rotate |
| Chroma key | Green/Blue screen ತೆಗೆಯುವುದು — auto detect, 🎯 preview ನಿಂದ ಬಣ್ಣ pick, intensity, edge smooth, spill remove |
| Blend modes | 16: Multiply, Screen, Overlay, Soft Light, Difference … |
| Mobile | ☰ Media drawer (phone ನಲ್ಲಿ music/PiP ಸೇರಿಸಲು) |
| Export | 480p / 720p / 1080p (Chrome ನಲ್ಲಿ MP4, ಇಲ್ಲದಿದ್ದರೆ WebM) |

> Export real-time ನಲ್ಲಿ ಆಗುತ್ತದೆ — 1 ನಿಮಿಷದ video ಗೆ ಸುಮಾರು 1 ನಿಮಿಷ. ಆ ಸಮಯದಲ್ಲಿ tab ತೆರೆದಿಡಿ.

## 🚀 GitHub ನಲ್ಲಿ ಉಚಿತವಾಗಿ ಹಾಕುವುದು (5 ನಿಮಿಷ)
1. github.com ನಲ್ಲಿ account ತೆರೆಯಿರಿ → **New repository** → ಹೆಸರು `chitracut` → **Public** → Create.
2. **Add file → Upload files** → ಈ folder ನ ಎಲ್ಲಾ files (`index.html, manifest.json, sw.js, icon-192.png, icon-512.png, README.md`) drag ಮಾಡಿ → **Commit**.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → **Save**.
4. 1–2 ನಿಮಿಷದಲ್ಲಿ link ಸಿಗುತ್ತದೆ: `https://<ನಿಮ್ಮ-username>.github.io/chitracut/`
5. **Phone app ಆಗಿ:** Chrome ನಲ್ಲಿ ಆ link ತೆರೆದು ⋮ → **Add to Home screen / Install app**.
6. **PC software ಆಗಿ:** Chrome/Edge ನಲ್ಲಿ address bar ನ install ⊕ icon ಒತ್ತಿ.

## ⌨️ Shortcuts
`Space` play/pause · `T` text · `K` keyframe · `Esc` pick cancel · `S` / `Ctrl+B` split · `Delete` · `Ctrl+Z` / `Ctrl+Y` · `←` `→` frame step

## 🗺️ Roadmap (ಮುಂದಿನ ಹಂತಗಳು)
- ~~Phase 2: Text, stickers, image clips, transitions~~ ✅
- ~~Phase 3: PiP, keyframes, masks, chroma key, blend modes~~ ✅
- **Phase 4:** Effects (glitch, shake, RGB split, VHS), audio waveform, voice recording, auto-captions, project save/open (IndexedDB)
- **Phase 5:** Fast export with FFmpeg.wasm, Android APK (Capacitor ಅಥವಾ TWA → Play Store), Windows .exe (Tauri/Electron)
- **Phase 6 – ಮಾರಾಟ (₹200/ವರ್ಷ):** Free version ನಲ್ಲಿ watermark + 720p; Pro ನಲ್ಲಿ 1080p/4K, no watermark, premium LUT/effects. Payment: Razorpay ಅಥವಾ Play Store billing; license check: Firebase/Supabase free tier.

## 📄 License
ನಿಮ್ಮ ಆಯ್ಕೆ. ಮುಂದೆ ಮಾರಾಟ ಮಾಡುವುದಾದರೆ code ಅನ್ನು open-source license ಇಲ್ಲದೆ (All rights reserved) ಇಡಬಹುದು ಅಥವಾ repo ಅನ್ನು private ಮಾಡಿ ಕೇವಲ Pages ಮೂಲಕ app ಕೊಡಬಹುದು.
