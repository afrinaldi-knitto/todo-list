# Proxy.ts Documentation

## Overview

File `proxy.ts` adalah implementasi Next.js 16 Proxy yang berjalan sebelum request mencapai route handler. Proxy ini menangani berbagai cross-cutting concerns yang umum untuk semua request.

## Features

### 1. Request Logging
- Log semua API requests dengan timestamp, method, pathname, dan Request ID
- Deteksi slow requests (>1 detik) dengan warning
- Request ID untuk tracing dan debugging

### 2. CORS Headers
- Otomatis set CORS headers untuk semua API routes
- Support untuk preflight OPTIONS requests
- Configurable allowed origin via environment variable `ALLOWED_ORIGIN`

### 3. Security Headers
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer information
- `Permissions-Policy` - Restrict browser features

### 4. Request ID Tracing
- Generate unique Request ID untuk setiap request
- Request ID tersedia di:
  - Request header: `x-request-id`
  - Response header: `X-Request-ID`
- Berguna untuk tracing request di logs dan debugging

## Configuration

### Matcher Pattern
Proxy hanya berjalan pada routes yang match pattern berikut:
- Exclude: `_next/static`, `_next/image`, `_next/data`
- Exclude: Static files (images, fonts, CSS, JS)
- Exclude: Metadata files (favicon.ico, sitemap.xml, robots.txt)
- Include: Semua routes lainnya (API routes dan pages)

### Environment Variables
- `ALLOWED_ORIGIN`: Origin yang diizinkan untuk CORS (default: "*" atau request origin)

## Execution Order

Menurut Next.js documentation, execution order adalah:
1. `headers` from `next.config.js`
2. `redirects` from `next.config.js`
3. **Proxy** (rewrites, redirects, headers) ← **Kita di sini**
4. `beforeFiles` (rewrites) from `next.config.js`
5. Filesystem routes
6. `afterFiles` (rewrites) from `next.config.js`
7. Dynamic Routes
8. `fallback` (rewrites) from `next.config.js`

## Why Not Authentication in Proxy?

Authentication **tidak** dilakukan di proxy karena:
1. **Fleksibilitas**: Beberapa routes (auth routes) tidak memerlukan authentication
2. **Edge Runtime**: Proxy berjalan di Edge Runtime yang memiliki limitations
3. **Better Error Handling**: Authentication di route handler memberikan error handling yang lebih baik
4. **Separation of Concerns**: Authentication logic lebih baik di api-handler untuk maintainability

Authentication tetap ditangani di `api-handler.ts` dengan `createApiHandler()` yang lebih fleksibel.

## Usage Example

Proxy berjalan otomatis untuk semua routes yang match pattern. Tidak perlu import atau setup tambahan.

### Accessing Request ID in Route Handler

```typescript
export const GET = createApiHandler(async (request, context) => {
  const requestId = request.headers.get("x-request-id");
  console.log(`Processing request: ${requestId}`);
  // ... handler logic
});
```

### Custom CORS Configuration

Set environment variable:
```bash
ALLOWED_ORIGIN=https://yourdomain.com
```

## Best Practices

1. **Keep Proxy Lightweight**: Proxy berjalan untuk setiap request, jadi jangan lakukan operasi berat
2. **Use Background Tasks**: Untuk logging atau analytics, gunakan `event.waitUntil()`
3. **Don't Duplicate Logic**: Jangan duplikasi logic yang sudah ada di route handlers
4. **Monitor Performance**: Proxy menambahkan overhead, monitor performance impact

## Future Enhancements

Potensi enhancement yang bisa ditambahkan:
- Rate limiting (lebih baik di service terpisah)
- Request/Response transformation
- API versioning headers
- Analytics tracking
- Error tracking integration

