describe('Profile Domain', () => {
  beforeEach(() => {
    cy.login(['customer', 'admin'])
  })

  it('should load profile page with profile fields', () => {
    cy.visit('/customer/profile/')

    cy.get('[data-automation-id="profile-view-page"]').should('be.visible')
    cy.get('[data-automation-id="profile-view-name-input"]').should('be.visible')
    cy.get('[data-automation-id="profile-view-description-input"]').should('be.visible')
    cy.get('[data-automation-id="profile-view-status-input"]').should('be.visible')
  })

  it('should update profile description and persist changes', () => {
    cy.visit('/customer/profile/')

    const timestamp = Date.now()
    const updatedDescription = `Updated profile description ${timestamp}`

    cy.get('[data-automation-id="profile-view-description-input"]')
      .find('textarea')
      .clear()
      .type(updatedDescription)
      .blur()

    cy.wait(1000)

    // Reload page to verify persistence
    cy.visit('/customer/profile/')
    cy.get('[data-automation-id="profile-view-description-input"]')
      .find('textarea')
      .should('have.value', updatedDescription)
  })
})
