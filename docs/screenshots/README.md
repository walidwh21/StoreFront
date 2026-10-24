# Screenshots

These images are real captures of the running app (1280 x 720), taken with the demo accounts from the main README so no personal data appears.

## Regenerate

```bash
npm install && npm --prefix server install
cp server/.env.example server/.env
npm run api &                      # http://localhost:3000
npm start &                        # http://localhost:4200
npm run start:ar -- --port 4201 &  # Arabic build, for i18n-arabic.png
pip install playwright && playwright install chromium
AR=1 python3 docs/screenshots/capture.py
```

`capture.py` signs in as the member / admin demo users, fills the cart and visits each page. The environment these were produced in had no internet access, so the script also:

- replaces the external product photos (`cdn.dummyjson.com`) with generated placeholder images,
- replaces OpenStreetMap tiles with a generated tile,
- mocks the browser geolocation (Paris) so the checkout page shows no error toast.

Remove the `c.route(...)` calls and the `geolocation` option in `ctx()` to capture with real images and map tiles. The script never submits an order, so `server/data` is left untouched.

| File | Page | Signed in as |
| ---- | ---- | ------------ |
| `signin.png` | `/signin` | - |
| `signup.png` | `/signup` | - |
| `catalog.png` | `/catalog` | - |
| `product-details.png` | `/product-details/1` | - |
| `cart.png` | cart modal (3 items added) | member |
| `checkout.png` | `/order-page` | member |
| `profile.png` | `/profile`, Orders tab | member |
| `order-details.png` | first order from the profile | member |
| `stock-monitoring.png` | `/stock-monitoring` | admin |
| `offer-management.png` | `/offers` | admin |
| `user-management.png` | `/user-management` | admin |
| `i18n-arabic.png` | `/catalog` on the Arabic build | - |
