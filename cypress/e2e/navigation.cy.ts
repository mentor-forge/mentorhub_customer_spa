/**
 * Navigation chrome coverage for the spa_utils `PageFrame` shell under the `/customer/` base.
 *
 * Every automation id asserted here is compiled into `@mentor-forge/mentorhub_spa_utils`
 * (`nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-home-link`,
 * `nav-customer-link`, `nav-customer-members-link`, `nav-notifications-link`,
 * `nav-products-link`, `nav-settings-link`, `nav-logout-link`).
 * This SPA defines no `nav-*` id of its own.
 *
 * Role-gated rows are asserted as an exact, ordered id list read from the DOM rather than
 * by naming every absent row, because `cy.login()` with no argument seeds an **admin**
 * token: a bare `cy.login()` would show Products and Settings too.
 */
describe('Navigation (spa_utils PageFrame)', () => {
  const APP_ORIGIN = Cypress.config('baseUrl') as string
  const CUSTOMER_HOME = '/customer/'
  const IDP_STUB_PATHNAME = '/login.html'

  /** Point the container's IdP at a same-origin stub: the real value is a cross-origin
   *  Tailscale MagicDNS host, and `runtime-config.js` is the highest-priority source. */
  function stubIdpLoginUri() {
    cy.intercept('GET', '**/customer/runtime-config.js', {
      statusCode: 200,
      headers: { 'content-type': 'application/javascript', 'cache-control': 'no-store' },
      body: `window.__MENTORHUB_RUNTIME__ = Object.assign(window.__MENTORHUB_RUNTIME__ || {}, { IDP_LOGIN_URI: '${APP_ORIGIN}${IDP_STUB_PATHNAME}' });`,
    }).as('getRuntimeConfig')

    cy.intercept('GET', `**${IDP_STUB_PATHNAME}*`, {
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: '<html><head><title>Stub IdP</title></head><body>stub idp login</body></html>',
    }).as('getIdpLogin')
  }

  function openDrawer() {
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible').click({ force: true })
    cy.get('.v-navigation-drawer', { timeout: 5000 }).should('be.visible')
  }

  /** Ordered automation ids of the catalog rows (the drawer's first list, above the divider). */
  function drawerCatalogIds() {
    return cy
      .get('.v-navigation-drawer .v-list')
      .first()
      .find('[data-automation-id]')
      .then(($rows) => [...$rows].map((row) => row.getAttribute('data-automation-id') ?? ''))
  }

  function assertAlbHref(automationId: string, expectedPath: string) {
    cy.get(`[data-automation-id="${automationId}"]`)
      .should('match', 'a')
      .and('have.attr', 'href')
      .then((href) => {
        const url = new URL(String(href))
        expect(url.port, `${automationId} port`).to.equal('8080')
        expect(url.pathname, `${automationId} pathname`).to.equal(expectedPath)
        expect(String(href)).not.to.include(':8388')
        expect(String(href)).not.to.include('/customer/customer')
      })
  }

  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('should serve the app shell and its assets under the /customer/ prefix', () => {
    cy.login(['customer'])

    cy.location('pathname').should('eq', CUSTOMER_HOME)
    cy.document().then((doc) => {
      const sources = [...doc.querySelectorAll('script[src]')].map((tag) => tag.getAttribute('src'))
      expect(sources, 'runtime config is fetched under the prefix').to.include(
        '/customer/runtime-config.js'
      )
      expect(
        sources.some((src) => src?.startsWith('/customer/assets/')),
        'app bundle is fetched under the prefix'
      ).to.equal(true)
    })
  })

  it('should send API requests to the prefixed /customer/api base', () => {
    cy.intercept('GET', '**/api/config', { statusCode: 200, body: { enumerators: [] } }).as(
      'anyConfigRequest'
    )
    cy.login(['customer'])

    cy.wait('@anyConfigRequest').then((interception) => {
      expect(new URL(interception.request.url).pathname).to.equal('/customer/api/config')
    })
  })

  it('should show the hamburger and the customer profile link when authenticated', () => {
    cy.login(['customer'])

    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="page-frame-title"]')
      .should('be.visible')
      .and('contain.text', 'Customer')
    assertAlbHref('nav-profile-link', '/customer/profile/')
  })

  it('should show customer catalog rows for a plain customer token (no admin rows)', () => {
    cy.login(['customer'])
    openDrawer()

    drawerCatalogIds().should('deep.equal', [
      'nav-home-link',
      'nav-customer-link',
      'nav-customer-members-link',
      'nav-notifications-link',
    ])
    assertAlbHref('nav-home-link', '/discovery/')
    assertAlbHref('nav-customer-link', '/customer/')
    assertAlbHref('nav-customer-members-link', '/discovery/members/')
    assertAlbHref('nav-notifications-link', '/discovery/notifications')
    cy.get('[data-automation-id="nav-logout-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-products-link"]').should('not.exist')
    cy.get('[data-automation-id="nav-settings-link"]').should('not.exist')
  })

  it('should add the role-gated Products and Settings rows for an admin token', () => {
    cy.login(['admin'])
    openDrawer()

    drawerCatalogIds().should('deep.equal', [
      'nav-home-link',
      'nav-products-link',
      'nav-notifications-link',
      'nav-settings-link',
    ])
    assertAlbHref('nav-products-link', '/discovery/products')
    assertAlbHref('nav-settings-link', '/admin/settings')
    cy.get('[data-automation-id="nav-customer-link"]').should('not.exist')
    cy.get('[data-automation-id="nav-customer-members-link"]').should('not.exist')
  })

  it('should clear auth and leave for the IdP login URL on logout', () => {
    stubIdpLoginUri()
    cy.login(['customer'])

    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    openDrawer()
    cy.get('[data-automation-id="nav-logout-link"]').should('be.visible').click()

    // `PageFrame` returns to the ROOT origin, not `/customer/` (recorded spa_utils limitation),
    // so only the IdP pathname and the presence of `return_to` are asserted.
    cy.location('pathname', { timeout: 10000 }).should('eq', IDP_STUB_PATHNAME)
    cy.location('search').should('include', 'return_to=')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.equal(null)
      expect(win.localStorage.getItem('user_roles')).to.equal(null)
    })
  })

  it('should return an unauthenticated deep link to its prefixed URL after login', () => {
    stubIdpLoginUri()
    // Plain `cy.visit`: the guard leaves for the IdP during bootstrap, so by the time
    // `cy.visitPrefixed` could read the navigation entry the document is the IdP stub.
    cy.visit('/customer/profile/')

    cy.location('pathname', { timeout: 10000 }).should('eq', IDP_STUB_PATHNAME)
    cy.location('search').then((search) => {
      const returnTo = new URLSearchParams(search).get('return_to') ?? ''
      expect(new URL(returnTo).pathname).to.equal('/customer/profile/')
    })
  })

  it('should serve the real container IdP config from the prefixed runtime-config.js', () => {
    cy.request('/customer/runtime-config.js').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.headers['cache-control']).to.contain('no-store')

      const configured = /IDP_LOGIN_URI:\s*'([^']+)'/.exec(String(response.body))?.[1] ?? ''
      expect(new URL(configured).pathname).to.equal('/login.html')
      expect(new URL(configured).port).to.equal('8080')
    })
  })
})
