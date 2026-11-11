# Backend integration handoff

This document distinguishes current frontend behavior from a proposed backend contract. Endpoint names below are a starting agreement for the backend developer; none of them is currently implemented or called by the frontend.

## Fixed recommendation decision

**THE SHORTLIST / Good finds. is the Recommended For You section.**

Integration path
- src/landing/LandingPage.jsx renders the existing title and FindsReel.
- src/landing/FindsReel.jsx imports column data and joins product IDs to catalog.js.
- src/landing/findsReelData.js owns six alternating feature/stack columns.
- src/landing/reelAutoplay.js owns automatic timing. Manual position remains continuous.

Current recommendation response shape to preserve

~~~json
{
  "columns": [
    {"kind":"feature","ids":[90],"tone":"peach"},
    {"kind":"stack","ids":[103,45,173]},
    {"kind":"feature","ids":[78],"tone":"blue"},
    {"kind":"stack","ids":[8,27,140]},
    {"kind":"feature","ids":[174],"tone":"sage"},
    {"kind":"stack","ids":[93,4,143]}
  ]
}
~~~

These are twelve unique products in three sets of four. Each set is one large product plus three small products. Five adjacent two-column views create the intermediate big/stack and stack/big handovers. Do not confuse five views with five recommendation sets.

A backend may rank products personally or supply curated anonymous results. Keep the existing section and title. Return valid catalogue IDs and renderable product records/images together, or ensure the catalogue has loaded before displaying this reel. Validate uniqueness and cardinality. Fall back to these curated IDs when personalized data is unavailable. No separate recommendation grid or additional homepage section is requested.

## Current storage and ownership

| Key / scope | Data | Call sites |
| --- | --- | --- |
| localStorage sense-wishlist | Array of numeric product IDs, shared by device | App, ProductCard, Wishlist |
| localStorage sense-bag | Array of {id,size,qty}, shared by device | App add(), Bag, CheckoutFlow |
| localStorage sense-coupon | Coupon string | Bag, Checkout wrapper |
| localStorage sense-orders | Order previews | CheckoutFlow, AccountCenter |
| localStorage sense-demo-accounts-v1 | {id,name,email,salt,hash} records | demoAuth.js |
| sessionStorage sense-demo-session-v1 | Signed-in demo account ID | demoAuth.js |
| localStorage sense-settings:ACCOUNT_ID | {addresses,payment} | accountPreferences.js |
| React component state | Filters, checkout address/step, chat threads, active gallery/tab | Corresponding page components |

Addresses contain id, name, phone, street, city and pin. The first address in the array is the default. Payment is one of No preference, UPI, Card, Cash on delivery. It is a preference only.

Order preview fields are id, owner, date, items, total and payment. Items contain joined catalogue fields plus size and qty. The final delivery address is currently **not included in the saved order preview**. New signed-in previews have owner=profile.id. Guest and older previews have no owner and are currently visible as device previews to signed-in users.

AccountCenter currently filters orders by current owner OR missing owner. Replace this with server-authorized ownership for real accounts. Do not automatically import guest previews into a user's real order history.

Demo passwords use PBKDF2 SHA-256, 210,000 iterations and a random salt in browser storage. This is demonstration logic, not a production authentication boundary. Password change checks the current password and replaces the hash. Public profile returns only id, name and email.

## Suggested service map

| Proposed endpoint | Connect at | Expected purpose |
| --- | --- | --- |
| POST /api/auth/register, /login, /logout | AuthPage, App authenticate(), demoAuth replacement | Real identity/session lifecycle |
| GET/PATCH /api/me | App profile bootstrap and AccountCenter | Public profile and updates |
| POST /api/me/password | AccountCenter PasswordForm | Current-password verification and password change |
| GET/POST /api/me/addresses | AccountCenter, CheckoutFlow | List/create addresses |
| PATCH/DELETE /api/me/addresses/:id | AddressBook | Edit/remove/default selection |
| GET /api/products | Catalogue, Header search | Filters, sorting, facets and pagination |
| GET /api/products/:id | ProductDetail | Full product, variants, availability and facts |
| GET /api/products/:id/related | ProductDetail related section | Up to five similar products |
| GET /api/recommendations | Existing Good finds reel | Three sets using the contract above |
| PUT/DELETE /api/me/wishlist/:productId | App wish(), Wishlist | User-owned favourites |
| GET /api/me/wishlist | App initialization | Saved product IDs/details |
| GET /api/cart; POST/PATCH/DELETE /api/cart/items | App add(), Bag | Guest/user cart and item quantities |
| POST /api/checkout/quote | Bag Summary and checkout | Authoritative prices, coupon, tax, delivery |
| POST /api/orders | CheckoutFlow confirm() | Validated order creation with idempotency |
| GET /api/me/orders | AccountCenter Orders | Authorized order history |
| POST /api/payments/session | Checkout payment step | Provider checkout session |
| POST /api/payments/webhook | Backend only | Verified payment status updates |
| POST /api/assistant/messages | SenseChat send() | Shopping/help replies |
| POST /api/support/tickets | Future help desk escalation | Real support requests if added |

The wishlist collection endpoint returns saved items; item endpoints add or remove a single product.

## Product and list contract

Existing frontend fields
- Identity and display: id (number), title, brand, category, subcategory, sku.
- Media: image (URL), images (URL array).
- Commerce: price, originalPrice, discount, sizes (array).
- Discovery: tags, featured, rating, ratingCount.
- Details: description, colors, attributes, reviews.
- Review samples: name, rating, comment.

Read src/data/catalog.js for complete seed examples and ASSET-SOURCES.md for provenance. Product-detail presentation is enriched by presentation(product), needsSize(product), productType(product), and categoryExperience in src/data/product-details.js. The backend must preserve these mappings or return equivalent category-specific specifications, highlights, care guidance and sources.

Current price fields are INR rupee amounts. money() rounds and formats them with en-IN. Payment gateways generally accept integer minor units. Explicitly convert at the integration boundary and document the wire representation. Never feed paise into existing rupee fields.

Proposed list response

~~~json
{
  "items": [],
  "total": 97,
  "nextCursor": null,
  "facets": {"brands": [], "types": [], "sizes": []}
}
~~~

Support category, q, type, brands, size, maximum price, minimum rating, minimum discount and sort. Current sort keys are recommended, rating, low, high, discount. Current recommended sorting uses featured flags, independently of the Good finds recommendation section. Current catalogue pagination is local slice() with 20 more items per click.

## Cart, pricing and order creation

The current cart identifies a line by product ID plus size, limits quantity to 10, and looks up prices from the local catalogue. The backend should introduce a variant ID where applicable and validate availability, size and quantity.

The demo coupon SENSE25 reduces subtotal by 25%, capped at ₹200. Shipping is ₹0 for an empty cart or subtotal at least ₹999, otherwise ₹49. Backend quote logic becomes authoritative, including expired coupons, inventory changes, shipping eligibility and taxes.

Suggested checkout request

~~~json
{
  "cartId": "server-cart-id",
  "addressId": "server-address-id",
  "paymentMethod": "upi",
  "couponCode": "SENSE25",
  "idempotencyKey": "one-key-per-confirm-attempt"
}
~~~

Support a validated inline address for guest checkout if that feature is retained. Snapshot the delivery address and purchased line prices into the order so later edits do not alter historical orders. Repeated confirmations with the same key must return the same order.

Current CheckoutFlow steps are address, payment, done. Saved addresses appear as radio cards. New addresses can be saved to the account before continuing. Payment offers UPI, Card and Cash on delivery. Confirm currently saves a local preview and clears the bag. Replace that operation with the server order lifecycle.

Use a payment provider's hosted/tokenized flow for real credentials. The existing payment preference is not a saved card or UPI credential. Verify webhooks on the server and do not mark an order paid solely because the browser returned from checkout. Keep the cart recoverable after declines or network failures. Associate pending orders and payment retries consistently.

## Auth and storage migration

1. Add an API client/service layer before changing page presentation.
2. Fetch /me on app initialization; represent loading, signed-out and authenticated states explicitly.
3. Replace demoAuth calls with service calls. Use server sessions and authorization for all account resources.
4. Scope addresses, wishlist and orders to the authorized account on the server.
5. Decide guest-cart merge behavior and explain it to the shopper. Merge by variant, validate stock, and avoid importing another device user's data silently.
6. Keep legacy demo credentials separate from real authentication. Provide a deliberate migration or reset path rather than treating local records as trusted identities.
7. Carry the account section redirect through login and preserve existing hash URLs.

## Assistant and help desk

SenseChat has separate shopper/help conversations and drafts while mounted. Closing the panel discards them. assistantReply(products,text,mode) in shop.js currently returns:

~~~json
{
  "who": "bot",
  "text": "Helpful answer",
  "picks": [],
  "action": {"to": "/account?section=orders", "label": "View orders"},
  "help": false
}
~~~

The optional fields vary by reply. Picks are full catalogue objects. Rendered actions navigate into the app and close the panel. A future service should return validated product references and allowlisted internal actions. Order assistance must authorize the user's order rather than trust a supplied ID. Live agent escalation, tickets and tracking are future backend features. Update demo help statements only once those capabilities actually exist.

## Integration sequence and acceptance

- Establish auth/profile and catalogue contracts first.
- Integrate per-user wishlist, cart and addresses next.
- Replace local quote/order operations and add provider payment flow.
- Feed the existing Good finds and similar-product sections.
- Connect assistant/support and real order statuses.
- Verify browser storage migration, expired sessions, timeouts, empty lists, invalid IDs, unavailable variants, coupon rejection, duplicate checkout submission, failed payment and delayed webhook completion.
- Check login/registration, all filters, product sizes, wishlist actions, cart totals, saved-address selection, account edits and password changes end to end.
- Test desktop and mobile, keyboard/focus, reduced motion, route changes and animation teardown with asynchronous data.
- Keep local secrets out of Vite client code. Introduce documented environment variables and backend-origin configuration when the backend exists.

No frontend implementation or deployment is part of this documentation handoff.
