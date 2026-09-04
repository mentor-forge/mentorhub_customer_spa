/**
 * Host routing and PageFrame wiring for Customer.
 * Hamburger catalog role gates and collection hrefs are covered in spa_utils.
 */
describe('Navigation (spa_utils PageFrame)', () => {
  const APP_ORIGIN = Cypress.config('baseUrl') as string
  const CUSTOMER_HOME = '/customer/'
  const CONFIG_PATHNAME = '/customer/config'
  const IDP_STUB_PATHNAME = '/login.html'
  const SETTINGS_HREF = `${APP_ORIGIN}${CONFIG_PATHNAME}`

  const STUB_DISPLAY_NAME = 'Ada Lovelace'

  const adminConfigBody = {
    config_items: [],
    versions: [],
    enumerators: [],
    token: {
      display_name: STUB_DISPLAY_NAME,
      profile_id: 'profile-e2e',
      customer_id: 'customer-e2e',
      mentor_id: 'mentor-e2e',
    },
  }

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

  function stubAdminConfig() {
    cy.intercept('GET', '**/customer/api/config', adminConfigBody).as('getAdminConfig')
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

  it('shows Customer PageFrame chrome', () => {
    cy.login(['customer'])

    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="page-frame-title"]')
      .should('be.visible')
      .and('contain.text', 'Customer')
    cy.get('[data-automation-id="nav-profile-link"]').should('be.visible')
    // Config token display_name lives in the drawer, not under the avatar.
    cy.get('[data-automation-id="nav-profile-link"]')
      .find('[data-automation-id="nav-profile-name-display"]')
      .should('not.exist')
  })

  it('hosts Settings at /customer/config for admin with token claims', () => {
    stubAdminConfig()
    cy.login(['admin'])
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible').click({ force: true })

    cy.get('[data-automation-id="nav-settings-link"]')
      .should('have.attr', 'href', SETTINGS_HREF)
      .click()
    cy.wait('@getAdminConfig')
    cy.location('origin').should('eq', APP_ORIGIN)
    cy.location('pathname').should('eq', CONFIG_PATHNAME)
    cy.url().should('not.include', '/customer/customer')

    cy.get('[data-automation-id="admin-tab-token"]').click()
    cy.get('[data-automation-id="admin-token-display-name-display"]')
      .find('input')
      .should('have.value', STUB_DISPLAY_NAME)
    cy.get('[data-automation-id="admin-token-profile-id-display"]')
      .find('input')
      .should('have.value', 'profile-e2e')
    cy.get('[data-automation-id="admin-token-customer-id-display"]')
      .find('input')
      .should('have.value', 'customer-e2e')
    cy.get('[data-automation-id="admin-token-mentor-id-display"]')
      .find('input')
      .should('have.value', 'mentor-e2e')
  })

  it('shows unknown on Token tab when config token omits display_name', () => {
    const { display_name: _omitted, ...idsOnly } = adminConfigBody.token
    cy.intercept('GET', '**/customer/api/config', {
      ...adminConfigBody,
      token: {
        ...idsOnly,
        name: 'Should Not Appear',
        given_name: 'Also Hidden',
        email: 'hidden@example.com',
      },
    }).as('getAdminConfigMissingDisplayName')

    cy.login(['admin'])
    cy.visitPrefixed(CONFIG_PATHNAME)
    cy.wait('@getAdminConfigMissingDisplayName')
    cy.url().should('not.include', '/customer/customer')

    cy.get('[data-automation-id="admin-tab-token"]').click()
    cy.get('[data-automation-id="admin-token-display-name-display"]')
      .find('input')
      .should('have.value', 'unknown')
      .and('not.have.value', 'Should Not Appear')
    cy.get('[data-automation-id="admin-token-profile-id-display"]')
      .find('input')
      .should('have.value', 'profile-e2e')
    cy.get('[data-automation-id="admin-token-customer-id-display"]')
      .find('input')
      .should('have.value', 'customer-e2e')
    cy.get('[data-automation-id="admin-token-mentor-id-display"]')
      .find('input')
      .should('have.value', 'mentor-e2e')
  })

  it('shows config token display_name in PageFrame chrome', () => {
    stubAdminConfig()
    cy.login(['admin'])
    cy.wait('@getAdminConfig')

    cy.get('[data-automation-id="nav-profile-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-profile-link"]')
      .find('[data-automation-id="nav-profile-name-display"]')
      .should('not.exist')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible').click({ force: true })
    cy.get('[data-automation-id="nav-logout-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-profile-name-display"]')
      .should('be.visible')
      .and('contain', STUB_DISPLAY_NAME)
  })

  it('should keep an admin on /customer/config', () => {
    stubAdminConfig()
    cy.login(['admin'])
    cy.visitPrefixed(CONFIG_PATHNAME)

    cy.wait('@getAdminConfig')
    cy.location('origin').should('eq', APP_ORIGIN)
    cy.location('pathname').should('eq', CONFIG_PATHNAME)
    cy.url().should('not.include', '/customer/customer')
    cy.get('[data-automation-id="admin-tab-token"]').should('be.visible')
  })

  it('should not keep a non-admin on /customer/config showing AdminPage', () => {
    const seenUrls: string[] = []
    cy.on('url:changed', (url) => {
      seenUrls.push(url)
    })

    cy.login(['customer'])
    cy.visit(CONFIG_PATHNAME)

    // Guard replaces to ALB /discovery/; live Discovery may bounce to IdP
    // (welcome :8080 or Tailscale). Do not query the AUT after that hop.
    cy.wrap(seenUrls, { timeout: 10000 }).should((urls) => {
      const leftAdmin = urls.some((url) => {
        const leftConfig = !url.includes('/customer/config')
        const discoveryOrIdp = url.includes('/discovery/') || url.includes('/login.html')
        return leftConfig && discoveryOrIdp
      })
      expect(leftAdmin, `navigations: ${urls.join(' -> ')}`).to.equal(true)
    })
  })

  it('should clear auth and leave for the IdP login URL on logout', () => {
    stubIdpLoginUri()
    cy.login(['customer'])

    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible').click({ force: true })
    cy.get('[data-automation-id="nav-logout-link"]').should('be.visible').click()

    cy.location('pathname', { timeout: 10000 }).should('eq', IDP_STUB_PATHNAME)
    cy.location('search').then((search) => {
      const returnTo = new URLSearchParams(search).get('return_to')
      expect(returnTo, 'logout return_to').not.to.equal(null)
      const returnUrl = new URL(returnTo!)
      expect(returnUrl.href).to.equal('http://localhost:8080/discovery/')
      expect(returnUrl.hostname).to.equal('localhost')
      expect(returnUrl.port).to.equal('8080')
      expect(returnUrl.pathname).to.equal('/discovery/')
      expect(returnUrl.href).not.to.include('127.0.0.1')
      expect(returnUrl.pathname).not.to.equal('/')
      expect(returnUrl.pathname).not.to.equal('/customer/')
      expect(returnUrl.href).not.to.include('/customer/')
    })
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.equal(null)
      expect(win.localStorage.getItem('user_roles')).to.equal(null)
    })
  })

  it('should return an unauthenticated deep link to its prefixed URL after login', () => {
    stubIdpLoginUri()
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
