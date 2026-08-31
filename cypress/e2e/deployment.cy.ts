/**
 * Deployment-boundary coverage for the `/customer/` nginx + Vite base model.
 *
 * These tests exercise container nginx (and the packaged API proxy) with `cy.request`,
 * not Vue Router. They prove the network edge that welcome nginx / the ALB depend on:
 * redirects, history fallback, cache headers, prefixed runtime-config, and that
 * `/customer/api/*` reaches customer_api (including the regex-vs-prefix precedence edge).
 */
describe('Deployment boundary (/customer/ nginx)', () => {
  function cacheControl(headers: Record<string, string | string[]>) {
    const raw = headers['cache-control'] ?? headers['Cache-Control'] ?? ''
    return Array.isArray(raw) ? raw.join(',') : String(raw)
  }

  function contentType(headers: Record<string, string | string[]>) {
    const raw = headers['content-type'] ?? headers['Content-Type'] ?? ''
    return Array.isArray(raw) ? raw.join(',') : String(raw)
  }

  it('redirects / and /customer to /customer/', () => {
    cy.request({ url: '/', followRedirect: false }).then((response) => {
      expect(response.status).to.be.oneOf([301, 302])
      expect(response.headers.location).to.equal('/customer/')
    })

    cy.request({ url: '/customer', followRedirect: false }).then((response) => {
      expect(response.status).to.be.oneOf([301, 302])
      expect(response.headers.location).to.equal('/customer/')
    })
  })

  it('serves the Customer SPA shell at /customer/ with no-store (not immutable)', () => {
    cy.request('/customer/').then((response) => {
      expect(response.status).to.equal(200)
      expect(contentType(response.headers)).to.include('text/html')
      expect(String(response.body)).to.include('Customer')
      expect(String(response.body)).to.include('/customer/runtime-config.js')
      expect(String(response.body)).to.match(/\/customer\/assets\/.+\.js/)

      const cc = cacheControl(response.headers)
      expect(cc).to.include('no-store')
      expect(cc).not.to.include('immutable')
    })
  })

  it('falls back history routes under /customer/ to the SPA document with no-store', () => {
    cy.request('/customer/profile/does-not-exist-yet').then((response) => {
      expect(response.status).to.equal(200)
      expect(contentType(response.headers)).to.include('text/html')
      expect(String(response.body)).to.include('/customer/runtime-config.js')

      const cc = cacheControl(response.headers)
      expect(cc).to.include('no-store')
      expect(cc).not.to.include('immutable')
    })
  })

  it('serves versioned /customer/assets with public, immutable caching', () => {
    cy.request('/customer/').then((shell) => {
      const match = /\/customer\/assets\/[^"']+\.js/.exec(String(shell.body))
      expect(match, 'hashed JS asset in shell').to.not.equal(null)

      cy.request(match![0]).then((asset) => {
        expect(asset.status).to.equal(200)
        const cc = cacheControl(asset.headers)
        expect(cc).to.include('public')
        expect(cc).to.include('immutable')
      })
    })
  })

  it('serves /customer/runtime-config.js with no-store and the Customer IdP URI', () => {
    cy.request('/customer/runtime-config.js').then((prefixed) => {
      expect(prefixed.status).to.equal(200)
      expect(cacheControl(prefixed.headers)).to.include('no-store')
      expect(cacheControl(prefixed.headers)).not.to.include('immutable')

      const configured =
        /IDP_LOGIN_URI:\s*'([^']+)'/.exec(String(prefixed.body))?.[1] ?? ''
      expect(configured, 'prefixed runtime-config must define IDP_LOGIN_URI').to.not.equal('')
      expect(new URL(configured).pathname).to.equal('/login.html')
      expect(new URL(configured).port).to.equal('8080')

      // Same generated file as the direct-port root location — this SPA must not silently
      // serve another journey's root-level runtime-config when the browser asks for /customer/.
      cy.request('/runtime-config.js').then((root) => {
        expect(root.status).to.equal(200)
        expect(cacheControl(root.headers)).to.include('no-store')
        expect(String(root.body)).to.equal(String(prefixed.body))
      })
    })
  })

  it('does not let the static-asset regex swallow /customer/api/*.js', () => {
    // Without `^~` on `/customer/api/`, nginx would evaluate the `.js` asset regex and miss
    // the API proxy. A proxied miss comes from customer_api (JSON or its own 404 page),
    // never the Customer SPA shell or an immutable asset response.
    cy.request({
      url: '/customer/api/definitely-not-a-static-asset.js',
      failOnStatusCode: false,
    }).then((response) => {
      expect(String(response.body)).not.to.include('/customer/runtime-config.js')
      expect(String(response.body)).not.to.include('/customer/assets/')
      expect(String(response.body)).not.to.include('<title>Customer</title>')
      expect(cacheControl(response.headers)).not.to.include('immutable')
      expect(response.status).to.be.oneOf([401, 403, 404])
    })
  })

  it('returns an API authorization failure (not the SPA) for unauthenticated /customer/api', () => {
    cy.request({
      url: '/customer/api/config',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401)
      expect(contentType(response.headers)).to.match(/json|plain/)
      expect(String(response.body)).not.to.include('<!DOCTYPE html>')
      expect(String(response.body)).not.to.include('/customer/runtime-config.js')
    })
  })

  it('proxies an authenticated Bearer request through /customer/api to customer_api', () => {
    cy.task<{ token: string }>('signCypressJwt', {
      roles: ['customer'],
      secret: Cypress.env('JWT_SECRET'),
    }).then(({ token }) => {
      cy.request({
        url: '/customer/api/config',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(contentType(response.headers)).to.include('json')
        expect(response.body).to.be.an('object')
        // Runtime config enumerators are owned by the API; assert shape, not values.
        expect(Object.keys(response.body as object).length).to.be.greaterThan(0)
      })
    })
  })
})
