# Converts studio renders (renders-raw/*.png) into web images in public/products/.
import glob, os
from PIL import Image
os.makedirs('public/products', exist_ok=True)
for f in sorted(glob.glob('renders-raw/*.png')):
    name = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGB')
    im.save(f'public/products/{name}.webp', 'WEBP', quality=86, method=6)
    im.resize((500, 500), Image.LANCZOS).save(f'public/products/{name}-sm.webp', 'WEBP', quality=82, method=6)
    print(name)
