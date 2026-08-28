describe('Customer Domain', () => {
  beforeEach(() => {
    cy.login(['customer'])
  })

  it('should load customer edit home page with customer fields', () => {
    cy.visit('/customer/')

    cy.get('[data-automation-id="customer-edit-page"]').should('be.visible')
    cy.get('[data-automation-id="customer-edit-name-input"]')
      .should('be.visible')
      .find('input')
      .should('have.value', 'ali')

    cy.get('[data-automation-id="customer-edit-description-input"]')
      .should('be.visible')
      .find('textarea')
      .should('include.value', 'Agile Learning Institute')

    cy.get('[data-automation-id="customer-edit-status-input"]')
      .should('be.visible')
      .find('input')
      .should('have.value', 'active')
  })
})
