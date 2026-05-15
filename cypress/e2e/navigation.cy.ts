describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should open navigation drawer with hamburger menu', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Check that drawer is visible with domain sections
    cy.contains('SUBSCRIPTION DOMAIN').should('be.exist')
    cy.contains('DASHBOARD DOMAIN').should('be.exist')
    cy.contains('EVENT DOMAIN').should('be.exist')
    cy.contains('PROFILE DOMAIN').should('be.exist')
    cy.contains('CUSTOMER DOMAIN').should('be.exist')
  })
  it('should have all subscription domain links in drawer', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-subscriptions-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-subscriptions-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all dashboard domain links in drawer', () => {
    cy.visit('/dashboards')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-dashboards-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-dashboards-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all event domain links in drawer', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-events-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have profile domain link in drawer', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-profiles-list-link"]').scrollIntoView().should('be.visible')
  })
  it('should have customer domain link in drawer', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-customers-list-link"]').scrollIntoView().should('be.visible')
  })

  it('should have admin and logout at bottom of drawer', () => {
    // Login with admin role to see admin link
    cy.login(['admin'])
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Admin and Logout should be visible in the drawer
    cy.get('[data-automation-id="nav-admin-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('should navigate to different pages from drawer', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').scrollIntoView().click()
    cy.url().should('include', '/events')
  })

  it('should close drawer after navigation', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').scrollIntoView().click()
    
    // Drawer should close after navigation (temporary drawer)
    cy.wait(500)
    cy.contains('SUBSCRIPTION DOMAIN').should('not.be.visible')
  })
})