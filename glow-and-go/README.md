# Glow & Go — Affordable Fashion Accessories

Business Analytics + EVD final project. A demo online shop built with HTML, CSS, JavaScript and **PyScript** (Python in the browser). The shop (search, cart, filters, codes, checkout) is event-driven JavaScript in `app.js` and works even when you double-click `index.html`. Checkout form validation runs in Python (`main.py`, PyScript) when the site is served over http(s), such as GitHub Pages, with a JavaScript fallback.

## Folder structure
```
index.html        page layout
styles.css        pink / cream / beige / rose-gold styling
app.js            shop logic: search, cart, filters, wishlist, buy now, checkout
main.py           PyScript: checkout validation (form submit -> Python)
pyscript.toml     PyScript config
assets/
  logo.svg        Glow & Go logo
  products/       product images (SVG placeholders, one per product id)
  promo-poster.svg
  promo.mp4       40 s sample promo video (replace with your own if you like)
```

## Run locally
Double-click `index.html` to use the shop. To also see the Python (PyScript) part work, run a local server:
```
cd glow-and-go
python -m http.server 8000
```
Open http://localhost:8000 (internet needed for PyScript and fonts).

## Before you submit
1. **Promo video:** a 40-second sample made from the product images is included at `assets/promo.mp4` and embedded on the landing page. Replace it with your own 30 s–1 min video if you have one (keep the name, under 100 MB).
2. **Real photos:** no photos were attached to the chat, so the products use SVG illustrations. Put your photos in `assets/products/` (for example `floral-backpack.jpg`, `statement-set.jpg`), then in `main.py` change the `img:` path in `app.js` (the line `img:\`assets/products/${id}.svg\``) to `.jpg`, or edit it per product.
3. **Real shopping links:** product pages show Shopee/Lazada *search* links only. They are not verified listings. If you find a real listing, add its URL yourself.
4. Test: type in the search bar (suggestions appear, click one to open it, then Buy now), plus category chips, sort, sale/bestseller/new filters, favorites, product details, add/remove/+/- in cart, codes `GLOW10` and `PINKY50`, checkout errors (leave fields empty) and confirmation, mobile width, video playback.
5. Add all group members as collaborators and make sure everyone commits.

## Publish on GitHub Pages
1. Create a **public** repository (e.g. `glow-and-go`) on github.com.
2. Upload all files and the `assets` folder (Add file > Upload files), then Commit. Or:
   `git init && git add . && git commit -m "Add Glow & Go site" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`
3. Repo **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`, Save.
4. After a minute the site is at `https://<username>.github.io/glow-and-go/`. Submit the repository link.

## Notes
- Checkout is a **demo**: no payments or orders are processed and form details are never stored or sent. Only the cart and favorites are kept in your browser's localStorage.
- Discount rules: GLOW10 = 10% off; PINKY50 = ₱50 off orders of ₱300+; delivery ₱49, free when the total after discounts is ₱500+.
