describe('Card Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should create a new card', () => {
    cy.visit('/cards/new')
    
    const timestamp = Date.now()
    const itemName = `test-card-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="card-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="card-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="card-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/cards/')
    cy.url().should('not.include', '/cards/new')
    
    // Verify the card name is displayed on edit page
    cy.get('[data-automation-id="card-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a card', () => {
    // First create a card
    cy.visit('/cards/new')
    const timestamp = Date.now()
    const itemName = `test-card-update-${timestamp}`
    const updatedName = `updated-card-${timestamp}`
    
    cy.get('[data-automation-id="card-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="card-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="card-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/cards/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="card-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="card-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="card-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="card-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="card-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="card-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
  })
})

