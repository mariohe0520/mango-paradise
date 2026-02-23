#!/usr/bin/env python3
"""Generate match-3 gem assets using SDXL-Turbo (local, 4 steps)"""
import torch
from diffusers import AutoPipelineForText2Image
from PIL import Image
import os, sys, time

MODEL_PATH = "/Users/mario/.openclaw/workspace/models/sdxl-turbo"
OUTDIR = os.path.dirname(os.path.abspath(__file__))
SIZE = 256  # Square gem icons

# Gem definitions: id -> (prompt, bg_color_hint)
GEMS = {
    "murloc": "a perfectly round polished emerald green crystal gem sphere, glossy, translucent, fish scale texture inside, glowing green, dark background, game icon, 3d render, highly detailed",
    "orc": "a perfectly round polished ruby red crystal gem sphere, glossy, translucent, flames inside, glowing red, dark background, game icon, 3d render, highly detailed",
    "elf": "a perfectly round polished amethyst purple crystal gem sphere, glossy, translucent, magical sparkles inside, glowing purple, dark background, game icon, 3d render, highly detailed",
    "mage": "a perfectly round polished sapphire blue crystal gem sphere, glossy, translucent, swirling energy inside, glowing blue, dark background, game icon, 3d render, highly detailed",
    "knight": "a perfectly round polished silver metallic crystal gem sphere, glossy, chrome finish, sword emblem inside, glowing silver white, dark background, game icon, 3d render, highly detailed",
    "dwarf": "a perfectly round polished topaz orange crystal gem sphere, glossy, translucent, amber fire inside, glowing warm orange, dark background, game icon, 3d render, highly detailed",
    "undead": "a perfectly round polished teal cyan crystal gem sphere, ghostly translucent, spectral mist inside, glowing teal, dark background, game icon, 3d render, highly detailed",
    "mango": "a perfectly round polished golden citrine crystal gem sphere, glossy, translucent, tropical golden glow inside, glowing gold yellow, dark background, game icon, 3d render, highly detailed",
    "dragon": "a perfectly round polished dark ruby crystal gem sphere, glossy, deep crimson with ember glow from within, dragon fire inside, dark background, game icon, 3d render, highly detailed",
    "skull": "a perfectly round polished obsidian black crystal gem sphere, glossy, dark energy swirling inside, faint purple glow, dark background, game icon, 3d render, highly detailed",
    "phoenix": "a perfectly round polished fire opal crystal gem sphere, glossy, translucent, phoenix flames orange red gold inside, radiant glow, dark background, game icon, 3d render, highly detailed",
}

NEG = "text, letters, words, label, watermark, blurry, low quality, deformed, ugly, flat, 2d, square, rectangular"

def main():
    print(f"Loading SDXL-Turbo from {MODEL_PATH}...")
    t0 = time.time()
    pipe = AutoPipelineForText2Image.from_pretrained(
        MODEL_PATH,
        torch_dtype=torch.float16,
        variant="fp16",
    )
    pipe.to("mps")  # Apple Silicon
    print(f"Model loaded in {time.time()-t0:.1f}s")

    os.makedirs(OUTDIR, exist_ok=True)
    
    # Generate each gem
    for gem_id, prompt in GEMS.items():
        outpath = os.path.join(OUTDIR, f"gem_{gem_id}.png")
        if os.path.exists(outpath) and "--force" not in sys.argv:
            print(f"  Skip {gem_id} (exists)")
            continue
        
        print(f"  Generating {gem_id}...")
        t1 = time.time()
        
        # Generate at 512x512 then downscale for crispness
        result = pipe(
            prompt=prompt,
            negative_prompt=NEG,
            num_inference_steps=4,
            guidance_scale=0.0,  # SDXL-Turbo uses 0 guidance
            width=512,
            height=512,
        ).images[0]
        
        # Resize to target
        result = result.resize((SIZE, SIZE), Image.LANCZOS)
        result.save(outpath, "PNG")
        print(f"    -> {outpath} ({time.time()-t1:.1f}s)")
    
    print(f"\nDone! {len(GEMS)} gems generated in {OUTDIR}")

if __name__ == "__main__":
    main()
