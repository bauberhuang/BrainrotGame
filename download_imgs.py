"""Download all brainrot images from the wiki into img/ folder."""
import re
import os
import time
import urllib.request
import urllib.error

# Known non-standard filenames from utils.js
KNOWN_FILES = {
    "Burbaloni Loliloli": "BurbaloniLuliloli.png",
    "Meowl": "Clear_background_clear_meowl_image.png",
    "Piccione Macchina": "PIGEONS_ARE_SPIES_MADE_BY_THE_GOVERNMENT.png",
    "Ballerino Lololo": "Ballerinolololo.png",
    "Rhino Toasterino": "Untitled210_20250808180116.png",
    "Chimpanzini Bananini": "ChimpanziniBananini.png",
    "Sigma Boy": "Sig_ma_Boy.png",
    "Svinina Bombardino": "Homicidio_doloso.png",
    "Cacto Hipopotamo": "Cacto_Hipopotamo1.png",
    "Bandito Bobritto": "Oi_Oi_Oi.png",
}

# Characters that already have local images (don't redownload)
SKIP_IDS = {
    "67", "tung-tung-tung-sahur", "ballerina-cappuccina",
    "tralalero-tralala", "fluri-flura", "strawberry-elephant", "lucky-block",
}

IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

def get_characters():
    """Parse data.js to get all character names and IDs."""
    with open("web/js/data.js", "r", encoding="utf-8") as f:
        content = f.read()

    # Find all character blocks in the characters array
    chars = []
    # Pattern: id: "xxx", ... name: "yyy",
    pattern = r'id:\s*"([^"]+)".*?name:\s*"([^"]+)"'
    for m in re.finditer(pattern, content, re.DOTALL):
        cid = m.group(1)
        name = m.group(2)
        if cid not in SKIP_IDS:
            chars.append((cid, name))
    return chars

def download_image(cid, name, filename, url):
    """Download a single image."""
    filepath = os.path.join(IMG_DIR, f"{cid}.png")
    if os.path.exists(filepath):
        print(f"  SKIP: {filepath} already exists")
        return True

    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Referer": "https://stealabrainrot.fandom.com/",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        with open(filepath, "wb") as f:
            f.write(data)
        size_kb = len(data) / 1024
        print(f"  OK: {cid}.png ({size_kb:.0f} KB) ← {filename}")
        return True
    except urllib.error.HTTPError as e:
        print(f"  FAIL: {cid} ({name}) → HTTP {e.code}")
        return False
    except Exception as e:
        print(f"  FAIL: {cid} ({name}) → {e}")
        return False

def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    chars = get_characters()
    print(f"Found {len(chars)} characters to download\n")

    success = 0
    fail = 0
    skip = 0

    for cid, name in chars:
        # Determine the wiki filename
        if name in KNOWN_FILES:
            filename = KNOWN_FILES[name]
        else:
            filename = name.replace(" ", "_") + ".png"

        url = f"https://stealabrainrot.fandom.com/wiki/Special:FilePath/{filename}"
        print(f"{cid} ({name})")
        print(f"  URL: {url}")

        result = download_image(cid, name, filename, url)
        if result:
            filepath = os.path.join(IMG_DIR, f"{cid}.png")
            if os.path.getsize(filepath) < 200:
                print(f"  WARN: file too small ({os.path.getsize(filepath)} bytes), likely HTML error page")
                os.remove(filepath)
                fail += 1
            else:
                success += 1
        else:
            fail += 1

        time.sleep(1)  # Rate limit

    print(f"\n--- Done: {success} OK, {fail} failed ---")

    # Now update data.js to use local paths
    if success > 0:
        print("\nUpdating data.js image paths...")
        with open("web/js/data.js", "r", encoding="utf-8") as f:
            content = f.read()

        # Replace img: null → img: "img/{cid}.png" for characters we downloaded
        for cid, name in chars:
            filepath = os.path.join(IMG_DIR, f"{cid}.png")
            if os.path.exists(filepath) and os.path.getsize(filepath) >= 200:
                # Replace the img field for this character
                pattern = f'(id: "{cid}".*?img: )null'
                replacement = f'\\1"img/{cid}.png"'
                content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)

        with open("web/js/data.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("data.js updated!")

    # Update fillCharacterImages in utils.js - no longer needed
    print("\nUpdate fillCharacterImages to skip already-downloaded images...")
    with open("web/js/utils.js", "r", encoding="utf-8") as f:
        utils_content = f.read()
    # No changes needed - fillCharacterImages already skips if ch.img is truthy
    print("utils.js is fine (fillCharacterImages skips non-null img)")

if __name__ == "__main__":
    main()
