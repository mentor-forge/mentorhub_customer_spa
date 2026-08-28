describe('Navigation Drawer', () => {
  const openDrawer = () => {
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible').click()
  }

  const assertAlbHref = (automationId: string, pathname: string) => {
    cy.get(`[data-automation-id="${automationId}"]`)
      .should(($link) => {
        const href = $link.attr('href')
        expect(href).to.eq(`http://localhost:8080${pathname}`)
        expect(href).not.to.include(':8388')
        expect(href).not.to.include('/customer/customer')
      })
  }

  it('renders PageFrame chrome and absolute navigation hrefs', () => {
    cy.login(['customer'])
    cy.visit('/customer/')

    cy.get('[data-automation-id="page-frame-title"]')
      .should('be.visible')
      .and('contain.text', 'Customer')
    assertAlbHref('nav-profile-link', '/customer/profile/')

    openDrawer()
    assertAlbHref('nav-customer-link', '/customer/')
    assertAlbHref('nav-customer-members-link', '/discovery/members/')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('shows customer catalog rows for a customer login', () => {
    cy.login(['customer'])
    cy.visit('/customer/')
    openDrawer()

    assertAlbHref('nav-customer-link', '/customer/')
    assertAlbHref('nav-customer-members-link', '/discovery/members/')
  })

  it('should logout and redirect to IdP login', () => {
    cy.login(['customer'])
    cy.visit('/customer/')
    openDrawer()
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().click()

    cy.origin('http://127.0.0.1:8080', () => {
      cy.location('pathname', { timeout: 10000 }).should('eq', '/login.html')
      cy.location('search').should('include', 'return_to=')
    })
  })
})
