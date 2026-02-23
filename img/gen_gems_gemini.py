#!/usr/bin/env python3
"""Generate match-3 gem assets using Gemini Nano Banana (image gen API)"""
import urllib.request, urllib.error, json, os, sys, base64, time

API_KEY = open("/Users/mario/.openclaw/workspace/.gemini-api-key").read().strip()
OUTDIR = os.path.dirname(os.path.abspath(__file__))
SIZE = 256

# Gemini image generation endpoint
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={API_KEY}"

GEMS = {
    "murloc": "Create a game icon: a perfectly round, glossy emerald GREEN crystal gem sphere on a pure black background. The gem has fish-scale texture visible inside, with a bright green inner glow. Photorealistic 3D render style, highly polished, no text.",
    "orc": "Create a game icon: a perfectly round, glossy crimson RED ruby crystal gem sphere on a pure black background. The gem has subtle flame patterns visible inside, with a bright red inner glow. Photorealistic 3D render style, highly polished, no text.",
    "elf": "Create a game icon: a perfectly round, glossy deep PURPLE amethyst crystal gem sphere on a pure black background. The gem has magical sparkle patterns inside, with a bright purple inner glow. Photorealistic 3D render style, highly polished, no text.",
    "mage": "Create a game icon: a perfectly round, glossy deep BLUE sapphire crystal gem sphere on a pure black background. The gem has swirling energy patterns inside, with a bright blue inner glow. Photorealistic 3D render style, highly polished, no text.",
    "knight": "Create a game icon: a perfectly round, glossy SILVER metallic chrome crystal gem sphere on a pure black background. The gem has a mirror-like chrome finish with white highlights. Photorealistic 3D render style, highly polished, no text.",
    "dwarf": "Create a game icon: a perfectly round, glossy warm ORANGE topaz crystal gem sphere on a pure black background. The gem has amber fire visible inside, with a bright orange inner glow. Photorealistic 3D render style, highly polished, no text.",
    "undead": "Create a game icon: a perfectly round, glossy TEAL cyan crystal gem sphere on a pure black background. The gem has ghostly spectral mist swirling inside, with an eerie teal glow. Photorealistic 3D render style, highly polished, no text.",
    "mango": "Create a game icon: a perfectly round, glossy GOLDEN citrine crystal gem sphere on a pure black background. The gem has a warm tropical golden glow from within. Photorealistic 3D render style, highly polished, no text.",
    "dragon": "Create a game icon: a perfectly round, glossy dark CRIMSON ruby crystal gem sphere on a pure black background. The gem has ember fire glowing from deep within, darker than regular red. Photorealistic 3D render style, highly polished, no text.",
    "skull": "Create a game icon: a perfectly round, glossy pure BLACK obsidian crystal gem sphere on a dark gray background. The gem has faint purple dark energy swirling inside. Photorealistic 3D render style, highly polished, no text.",
    "phoenix": "Create a game icon: a perfectly round, glossy fire OPAL crystal gem sphere on a pure black background. The gem shifts between orange, red, and gold colors like a phoenix flame. Photorealistic 3D render style, highly polished, no text.",
}

def generate_gem(gem_id, prompt):
    outpath = os.path.join(OUTDIR, f"gem_{gem_id}.png")
    if os.path.exists(outpath) and "--force" not in sys.argv:
        print(f"  Skip {gem_id} (exists)")
        return True
    
    print(f"  Generating {gem_id}...")
    t0 = time.time()
    
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageSizes": ["SQUARE_256"]
        }
    }).encode()
    
    req = urllib.request.Request(URL, data=data, headers={"Content-Type": "application/json"})
    
    try:
        resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
        # Extract image from response
        for part in resp.get("candidates", [{}])[0].get("content", {}).get("parts", []):
            if "inlineData" in part:
                img_data = base64.b64decode(part["inlineData"]["data"])
                with open(outpath, "wb") as f:
                    f.write(img_data)
                print(f"    -> {outpath} ({time.time()-t0:.1f}s)")
                return True
        print(f"    ERROR: No image in response for {gem_id}")
        return False
    except Exception as e:
        print(f"    ERROR: {e}")
        return False

def main():
    os.makedirs(OUTDIR, exist_ok=True)
    success = 0
    for gem_id, prompt in GEMS.items():
        if generate_gem(gem_id, prompt):
            success += 1
        time.sleep(2)  # Rate limit
    print(f"\nDone! {success}/{len(GEMS)} gems generated")

if __name__ == "__main__":
    main()
