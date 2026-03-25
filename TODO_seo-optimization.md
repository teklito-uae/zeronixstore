# SEO Optimization Plan: Zeronix UAE

## Context

- **Target keyword and search intent classification**:
  - Primary Keywords: "Computer components UAE", "Gaming PCs Dubai", "Buy PC parts online UAE", "Mosque Audio Systems UAE".
  - Search Intent: Mixed (Transactional and Commercial Investigation).
- **Target audience personas and funnel stage**:
  - Personas: Tech enthusiasts, gamers, B2B procurement (mosques/institutions), casual PC builders.
  - Funnel Stage: Middle of Funnel (MOFU) for category pages; Bottom of Funnel (BOFU) for specific product pages.
- **Content type and target word count**:
  - Content Types: Category landing pages, Product Detail Pages (PDP), Technical Guides/Blog, Homepage.
  - Average Target Word Count: Homepage (800+ words), Category Pages (400+ words context/FAQ), Blog/Guides (1,500+ words).

---

## SEO Strategy Plan

- [ ] **SEO-PLAN-1.1 [E-Commerce Core Cluster]**:
  - **Primary Keyword**: Computer components UAE
  - **Secondary Keywords**: PC parts Dubai, online PC store UAE, best gaming setup Sharjah
  - **Long-Tail Keywords**: Buy RTX 4090 online UAE, cheap DDR5 RAM Dubai
  - **Intent Classification**: Transactional

- [ ] **SEO-PLAN-1.2 [Mosque Audio Solutions Cluster]**:
  - **Primary Keyword**: Mosque audio systems UAE
  - **Secondary Keywords**: Amplifiers for mosques Dubai, acoustic speakers for masjid UAE
  - **Long-Tail Keywords**: Complete turnkey mosque audio installation services, best amplifiers for masjid indoor
  - **Intent Classification**: Commercial Investigation & Transactional

---

## SEO Optimization Items

- [ ] **SEO-ITEM-1.1 [Dynamic Meta Tags (React Helmet)]**:
  - **Element**: Title tag & Meta description
  - **Current State**: Hardcoded static tags in `index.html` (`<title>Zeronix UAE — Computer Components Store</title>`).
  - **Recommended Change**: Integrate `react-helmet-async` to inject dynamic `<title>`, `<meta name="description">`, canonicals, and Open Graph tags on a per-page and per-product basis.
  - **Rationale**: Search engines index specific products differently. Without dynamic routing metadata, all pages appear as duplicates of the homepage to basic crawlers unless using reliable SSR.

- [ ] **SEO-ITEM-1.2 [Schema Markup - Organization]**:
  - **Element**: JSON-LD Schema
  - **Current State**: None currently implemented on the homepage.
  - **Recommended Change**: Add `Organization` and `WebSite` schema markup into the `<head>` of the `index.html` or explicitly via Helmet on the Homepage component.
  - **Rationale**: Helps Google understand the entity (Zeronix UAE), enabling rich branded search results and improved Knowledge Graph visibility.

- [ ] **SEO-ITEM-1.3 [Schema Markup - Product]**:
  - **Element**: JSON-LD Product Schema
  - **Current State**: No structured data on `ProductDetail.tsx`.
  - **Recommended Change**: Dynamically generate `Product` schema in `ProductDetail.tsx` (Name, Description, Image, Offers, AggregateRating).
  - **Rationale**: Required for appearing in Google Shopping tabs, image searches with "Product" rich snippets, and displaying price/stock directly on SERPs.

- [ ] **SEO-ITEM-1.4 [Image Alt Text Verification]**:
  - **Element**: Image `alt` tags (`<img alt="..." />`)
  - **Current State**: Many carousel images (like "Banner 1") lack highly descriptive semantic keywords.
  - **Recommended Change**: Map API product names strictly to alt tags and update hardcoded frontend category banners to use keyword-rich text (e.g., `alt="High-performance Asus ROG Gaming Laptop UAE"` instead of `alt="Laptop"`).
  - **Rationale**: Captures passive traffic from Google Images and serves strict accessibility standards.

- [ ] **SEO-ITEM-1.5 [Robots.txt & Sitemap Generator]**:
  - **Element**: Crawlability and Indexing
  - **Current State**: Missing `sitemap.xml` and `robots.txt` in the frontend `public/` directory.
  - **Recommended Change**: In an SPA, dynamically generate a `sitemap.xml` on the Laravel backend representing all products/categories, and place an absolute reference in the frontend's `robots.txt`.
  - **Rationale**: Ensures search engine bots can effectively index single-page application routes and understand page hierarchy.

- [ ] **SEO-ITEM-1.6 [Internal Linking & Anchor Text]**:
  - **Element**: Site Navigation
  - **Current State**: Some generic anchor links (`See all`, `Browse`).
  - **Recommended Change**: Replace generic generic CTAs when embedded in text with keyword-rich links (e.g., "Browse All Gaming Components" instead of "See All"). Include breadcrumbs on the product detail pages.
  - **Rationale**: Distributes link equity better across category silos and indicates target keywords to crawlers.

---

## Proposed Code Changes

### `package.json` (Frontend)

To support dynamic SEO, install `react-helmet-async`.
```bash
npm install react-helmet-async
```

### `src/main.tsx` (Frontend - Implementation of HelmetProvider)

Wrap the app to enable dynamic head management.

```tsx
import { HelmetProvider } from 'react-helmet-async';

// Under ReactDOM.createRoot
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
```

### `src/pages/ProductDetail.tsx` (Example SEO Implementation)

```tsx
import { Helmet } from 'react-helmet-async';

// Inside your ProductDetail component, right before return
const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "image": product.primary_image_url,
  "description": product.description,
  "brand": {
    "@type": "Brand",
    "name": product.brand?.name || "Zeronix"
  },
  "offers": {
    "@type": "Offer",
    "url": window.location.href,
    "priceCurrency": "AED",
    "price": product.sale_price || product.price,
    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
  }
};

return (
  <>
    <Helmet>
      <title>{product.name} | Zeronix UAE</title>
      <meta name="description" content={`Buy ${product.name} in the UAE. Best price guaranteed. ` + product.description.slice(0, 100)} />
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
    
    {/* Existing Component Tree... */}
  </>
);
```

### `public/robots.txt`

Create a static `robots.txt` to point to the backend's sitemap.
```txt
User-agent: *
Allow: /

# Prevent indexing of internal routes like checkout/cart
Disallow: /cart
Disallow: /checkout
Disallow: /profile

# Point to backend generated sitemap
Sitemap: http://192.168.70.153:8000/api/sitemap.xml
```

---

## Quality Assurance Task Checklist

Before finalizing, verify:

- [ ] All keyword research is clustered by intent and funnel stage
- [ ] Title tag, meta description, and URL slug meet character limits and include target keywords
- [ ] Content outline matches the dominant search intent for the target keyword
- [ ] Schema markup type is appropriate and correctly structured
- [ ] Internal linking recommendations include specific anchor text
- [ ] Off-page strategy contains actionable, specific outreach targets
- [ ] No content cannibalization with existing pages on the site
