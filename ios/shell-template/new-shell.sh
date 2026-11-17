#!/usr/bin/env bash
# Kolam iOS shell generator: a SwiftUI WKWebView app around a live Kolam web app.
#
#   new-shell.sh <Name> <slug> <url> <icon.png> <tintHex> [options]
#
#   Name     App name shown on the Home Screen, e.g. "Vanam". Letters/digits (spaces allowed;
#            they are dropped for the Xcode target and folder: "Farmer Friend" -> FarmerFriend-iOS).
#   slug     Bundle id suffix: com.gopinath.<slug>
#   url      Live URL the app opens, e.g. https://vanam-app.vercel.app/
#   icon     Square PNG, ideally 1024 x 1024 (resized; transparency flattened onto white)
#   tintHex  The app's Kolam primary, e.g. 1F5A43 or #1F5A43 (AccentColor; dark mode gets a lighter mix)
#
# Options:
#   --hosts "a.com,b.com"   extra hosts that stay inside the app (the url's host is always included)
#   --dark-tint HEX         exact dark-mode tint instead of the automatic lighter mix
#   --team ID               Apple Developer team (default 22CAB8R3V5)
#   --category UTI          App Store category (default public.app-category.utilities)
#   --out DIR               output folder (default ~/Documents/<Target>-iOS)
#   --force                 overwrite an existing output folder
#
# The page must load kolam-ios.js; it recognises this shell by window.KolamShell and the
# "<Target>-iOS" user-agent token, and shows the iOS look only here (never in Safari).
set -euo pipefail

usage() { sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }
[ $# -ge 5 ] || usage
NAME="$1"; SLUG="$2"; URL="$3"; ICON="$4"; TINT="${5#\#}"; shift 5
HOSTS=""; DARK=""; TEAM="22CAB8R3V5"; CATEGORY="public.app-category.utilities"; OUT=""; FORCE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --hosts) HOSTS="$2"; shift 2 ;;
    --dark-tint) DARK="${2#\#}"; shift 2 ;;
    --team) TEAM="$2"; shift 2 ;;
    --category) CATEGORY="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

TARGET="$(printf '%s' "$NAME" | tr -cd 'A-Za-z0-9')"
[ -n "$TARGET" ] || { echo "Name needs at least one letter or digit."; exit 1; }
case "$TARGET" in [0-9]*) TARGET="App$TARGET" ;; esac
printf '%s' "$SLUG" | grep -Eq '^[A-Za-z][A-Za-z0-9-]*$' || { echo "slug must be letters, digits and hyphens (start with a letter)."; exit 1; }
printf '%s' "$TINT" | grep -Eq '^[0-9A-Fa-f]{6}$' || { echo "tintHex must be 6 hex digits, e.g. 1F5A43."; exit 1; }
[ -z "$DARK" ] || printf '%s' "$DARK" | grep -Eq '^[0-9A-Fa-f]{6}$' || { echo "--dark-tint must be 6 hex digits."; exit 1; }
case "$URL" in https://*|http://*) ;; *) echo "url must start with https://"; exit 1 ;; esac
[ -f "$ICON" ] || { echo "Icon not found: $ICON"; exit 1; }
BUNDLE="com.gopinath.$SLUG"
OUT="${OUT:-$HOME/Documents/$TARGET-iOS}"
TEMPLATE="$(cd "$(dirname "$0")" && pwd)/Template"

if [ -e "$OUT" ]; then
  [ "$FORCE" = 1 ] || { echo "$OUT already exists (use --force to overwrite)."; exit 1; }
  rm -rf "$OUT"
fi

HOST="$(printf '%s' "$URL" | sed -E 's#^https?://([^/:]+).*#\1#')"
HOSTS_SWIFT="$(printf '%s,%s' "$HOST" "$HOSTS" | tr ',' '\n' | sed 's/ //g' | awk 'NF && !seen[$0]++ { printf "%s\"%s\"", (n++ ? ", " : ""), $0 }')"

# Tint components (0-1) for the asset catalog; dark = 45% mix with white unless given.
read -r TL_R TL_G TL_B TD_R TD_G TD_B < <(python3 - "$TINT" "$DARK" <<'PY'
import sys
h = sys.argv[1]; d = sys.argv[2]
rgb = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
drk = [int(d[i:i+2], 16) / 255 for i in (0, 2, 4)] if d else [c + (1 - c) * .45 for c in rgb]
print(*[f"{c:.3f}" for c in rgb + drk])
PY
)

echo "Creating $OUT"
cp -R "$TEMPLATE" "$OUT"
mv "$OUT/gitignore.txt" "$OUT/.gitignore"
# Rename __TARGET__ paths (deepest first)
find "$OUT" -depth -name '*__TARGET__*' | while read -r p; do mv "$p" "$(dirname "$p")/$(basename "$p" | sed "s/__TARGET__/$TARGET/g")"; done

esc() { printf '%s' "$1" | sed -e 's/[\/&|]/\\&/g'; }
NAME_E="$(esc "$NAME")"; URL_E="$(esc "$URL")"; HOSTS_E="$(esc "$HOSTS_SWIFT")"
find "$OUT" -type f \( -name '*.swift' -o -name '*.pbxproj' -o -name '*.plist' -o -name 'Contents.json' \) -print0 | while IFS= read -r -d '' f; do
  sed -i '' \
    -e "s|__TARGET__|$TARGET|g" \
    -e "s|__DISPLAY_NAME__|$NAME_E|g" \
    -e "s|__BUNDLE_ID__|$BUNDLE|g" \
    -e "s|__HOME_URL__|$URL_E|g" \
    -e "s|__HOSTS__|$HOSTS_E|g" \
    -e "s|__UA_TOKEN__|$TARGET-iOS|g" \
    -e "s|__TEAM__|$TEAM|g" \
    -e "s|__CATEGORY__|$CATEGORY|g" \
    -e "s|__TL_R__|$TL_R|g; s|__TL_G__|$TL_G|g; s|__TL_B__|$TL_B|g" \
    -e "s|__TD_R__|$TD_R|g; s|__TD_G__|$TD_G|g; s|__TD_B__|$TD_B|g" \
    "$f"
done

# Icons: 1024 app icon with no transparency (App Store rule) + a 256 logo for the loading screen.
ASSETS="$OUT/$TARGET/Assets.xcassets"
if python3 -c 'import PIL' 2>/dev/null; then
  python3 - "$ICON" "$ASSETS" <<'PY'
import sys
from PIL import Image
src, assets = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
side = min(im.size); l = (im.width - side) // 2; t = (im.height - side) // 2
im = im.crop((l, t, l + side, t + side))
flat = Image.new('RGB', im.size, (255, 255, 255)); flat.paste(im, mask=im.split()[3])
flat.resize((1024, 1024), Image.LANCZOS).save(f'{assets}/AppIcon.appiconset/icon-1024.png')
flat.resize((256, 256), Image.LANCZOS).save(f'{assets}/AppLogo.imageset/logo.png')
PY
else
  sips -s format png -z 1024 1024 "$ICON" --out "$ASSETS/AppIcon.appiconset/icon-1024.png" >/dev/null
  sips -s format png -z 256 256 "$ICON" --out "$ASSETS/AppLogo.imageset/logo.png" >/dev/null
  echo "Note: Pillow not installed; check the icon has no transparency before submitting to the App Store."
fi

if grep -rq '__[A-Z_]*__' "$OUT" --include='*.swift' --include='*.pbxproj' --include='*.plist' --include='Contents.json'; then
  echo "Warning: unreplaced placeholders:"; grep -rn '__[A-Z_]*__' "$OUT" --include='*.swift' --include='*.pbxproj' --include='*.plist' --include='Contents.json' || true
fi

cat <<EOF

Done: $OUT
  App:        $NAME ($BUNDLE)
  Opens:      $URL
  In-app:     $HOSTS_SWIFT
  UA token:   $TARGET-iOS  (window.KolamShell is injected too)

Build for the Simulator:
  cd "$OUT"
  xcodebuild -project $TARGET.xcodeproj -scheme $TARGET -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \\
    -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
  xcrun simctl boot 'iPhone 17 Pro' 2>/dev/null || true; open -a Simulator
  xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/$TARGET.app
  xcrun simctl launch booted $BUNDLE
EOF
