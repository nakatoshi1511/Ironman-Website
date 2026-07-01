from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Bilder Landingpage" / "Hero" / "mobile-hero"
WIDTH = 1080
HEIGHT = 1920


def cover_crop(image, size, focus=(0.5, 0.5)):
    target_width, target_height = size
    scale = max(target_width / image.width, target_height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )

    max_left = max(0, resized.width - target_width)
    max_top = max(0, resized.height - target_height)
    left = round(max_left * focus[0]) if max_left else 0
    top = round(max_top * focus[1]) if max_top else 0
    return resized.crop((left, top, left + target_width, top + target_height))


def gradient_mask(top, bottom, fade_top, fade_bottom):
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)
    for y in range(max(0, top - fade_top), min(HEIGHT, bottom + fade_bottom)):
        if y < top:
            alpha = 255 * (y - (top - fade_top)) / fade_top
        elif y > bottom:
            alpha = 255 * (1 - (y - bottom) / fade_bottom)
        else:
            alpha = 255
        draw.line([(0, y), (WIDTH, y)], fill=round(max(0, min(255, alpha))))
    return mask


def polygon_mask(points, blur=40):
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def ellipse_mask(box, blur=80):
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    ImageDraw.Draw(mask).ellipse(box, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def multiply_masks(*masks):
    out = masks[0]
    for mask in masks[1:]:
        out = ImageChops.multiply(out, mask)
    return out


def paste_with_mask(canvas, image, xy, mask):
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    layer.paste(image.convert("RGBA"), xy)
    alpha = ImageChops.multiply(layer.getchannel("A"), mask)
    layer.putalpha(alpha)
    return Image.alpha_composite(canvas, layer)


def warm_grade(image):
    image = ImageEnhance.Color(image).enhance(1.08)
    image = ImageEnhance.Contrast(image).enhance(1.07)

    warm = Image.new("RGBA", image.size, (230, 145, 62, 24))
    image = Image.alpha_composite(image.convert("RGBA"), warm)

    shade = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shade)
    for y in range(HEIGHT):
        top_alpha = 95 * max(0, 1 - y / 365)
        bottom_alpha = 0
        if y > 1260:
            bottom_alpha = 218 * ((y - 1260) / (HEIGHT - 1260)) ** 1.24
        draw.line([(0, y), (WIDTH, y)], fill=(5, 8, 9, round(top_alpha + bottom_alpha)))

    for x in range(WIDTH):
        edge = min(x, WIDTH - x) / (WIDTH / 2)
        alpha = round(68 * max(0, 1 - edge) ** 1.7)
        draw.line([(x, 0), (x, HEIGHT)], fill=(5, 8, 9, alpha))

    return Image.alpha_composite(image, shade).convert("RGB")


def main():
    bike = Image.open(SRC / "Bike.JPG").convert("RGB")
    swim = Image.open(SRC / "swim.jpg").convert("RGB")
    run = Image.open(SRC / "run.JPG").convert("RGB")

    base = cover_crop(bike, (WIDTH, HEIGHT), focus=(0.62, 0.47)).convert("RGBA")
    base = ImageEnhance.Brightness(base).enhance(0.54)
    base = base.filter(ImageFilter.GaussianBlur(8))

    swim_panel = cover_crop(swim, (WIDTH, 760), focus=(0.45, 0.31))
    swim_panel = ImageEnhance.Color(swim_panel).enhance(1.04)
    swim_panel = ImageEnhance.Contrast(swim_panel).enhance(1.04)
    swim_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    swim_layer.paste(swim_panel.convert("RGBA"), (0, 235))
    swim_alpha = multiply_masks(
        swim_layer.getchannel("A"),
        gradient_mask(275, 840, 110, 150),
        polygon_mask([(-80, 285), (1160, 215), (1160, 780), (-80, 925)], blur=22),
    ).point(lambda value: round(value * 0.98))
    swim_layer.putalpha(swim_alpha)
    canvas = Image.alpha_composite(base, swim_layer)

    bike_focus = cover_crop(bike, (WIDTH, 870), focus=(0.63, 0.48))
    bike_focus = ImageEnhance.Color(bike_focus).enhance(1.04)
    bike_focus = ImageEnhance.Contrast(bike_focus).enhance(1.05)
    bike_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    bike_layer.paste(bike_focus.convert("RGBA"), (0, 600))
    bike_alpha = multiply_masks(
        bike_layer.getchannel("A"),
        gradient_mask(615, 1330, 80, 140),
        polygon_mask([(-80, 650), (1160, 520), (1160, 1325), (-80, 1480)], blur=24),
    ).point(lambda value: round(value * 0.97))
    bike_layer.putalpha(bike_alpha)
    canvas = Image.alpha_composite(canvas, bike_layer)

    run_crop = run.crop((0, 0, run.width, 1035))
    runner = cover_crop(run_crop, (WIDTH, 900), focus=(0.50, 0.00))
    runner = ImageEnhance.Brightness(runner).enhance(0.92)
    runner = ImageEnhance.Color(runner).enhance(0.96)
    runner = ImageEnhance.Contrast(runner).enhance(1.03)
    runner_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    runner_pos = (0, 1035)
    runner_layer.paste(runner.convert("RGBA"), runner_pos)
    runner_alpha = multiply_masks(
        runner_layer.getchannel("A"),
        gradient_mask(1045, 1700, 80, 170),
        polygon_mask([(-80, 1115), (1160, 960), (1160, 1785), (-80, 1900)], blur=24),
    ).point(lambda value: round(value * 0.93))
    runner_layer.putalpha(runner_alpha)
    canvas = Image.alpha_composite(canvas, runner_layer)

    final = warm_grade(canvas)

    jpg = SRC / "road-to-hawaii-mobile-hero-real.jpg"
    png = SRC / "road-to-hawaii-mobile-hero-real-master.png"
    final.save(png, "PNG", optimize=True)

    for quality in (90, 88, 86, 84, 82, 80, 78, 76):
        final.save(jpg, "JPEG", quality=quality, optimize=True, progressive=True)
        if jpg.stat().st_size <= 800 * 1024:
            break

    print(jpg)
    print(png)
    print(jpg.stat().st_size)


if __name__ == "__main__":
    main()
