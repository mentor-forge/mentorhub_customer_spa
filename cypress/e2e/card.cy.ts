describe('Card Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display cards list page', () => {
    cy.visit('/cards')
    cy.get('h1').contains('Cards').should('be.visible')
    cy.get('[data-automation-id="card-list-new-button"]').should('be.visible')
  })

  it('should navigate to new card page', () => {
    cy.visit('/cards')
    cy.get('[data-automation-id="card-list-new-button"]').click()
    cy.url().should('include', '/cards/new')
    cy.get('h1').contains('New Card').should('be.visible')
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
    
    // Navigate back to list and verify the card appears with updated name
    cy.get('[data-automation-id="card-edit-back-button"]').click()
    cy.url().should('include', '/cards')
    
    // Search for the updated card
    cy.get('[data-automation-id="card-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the card appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all cards are shown again
    cy.get('[data-automation-id="card-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for cards', () => {
    // First create a card with a unique name
    cy.visit('/cards/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="card-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="card-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="card-new-submit-button"]').click()
    cy.url().should('include', '/cards/')
    
    // Navigate to list page
    cy.visit('/cards')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the card
    cy.get('[data-automation-id="card-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the card
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all cards are shown again
    cy.get('[data-automation-id="card-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
