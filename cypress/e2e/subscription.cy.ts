describe('Subscription Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display subscriptions list page', () => {
    cy.visit('/subscriptions')
    cy.get('h1').contains('Subscriptions').should('be.visible')
    cy.get('[data-automation-id="subscription-list-new-button"]').should('be.visible')
  })

  it('should navigate to new subscription page', () => {
    cy.visit('/subscriptions')
    cy.get('[data-automation-id="subscription-list-new-button"]').click()
    cy.url().should('include', '/subscriptions/new')
    cy.get('h1').contains('New Subscription').should('be.visible')
  })

  it('should create a new subscription', () => {
    cy.visit('/subscriptions/new')
    
    const timestamp = Date.now()
    const itemName = `test-subscription-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="subscription-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="subscription-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="subscription-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/subscriptions/')
    cy.url().should('not.include', '/subscriptions/new')
    
    // Verify the subscription name is displayed on edit page
    cy.get('[data-automation-id="subscription-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a subscription', () => {
    // First create a subscription
    cy.visit('/subscriptions/new')
    const timestamp = Date.now()
    const itemName = `test-subscription-update-${timestamp}`
    const updatedName = `updated-subscription-${timestamp}`
    
    cy.get('[data-automation-id="subscription-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="subscription-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="subscription-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/subscriptions/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="subscription-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="subscription-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="subscription-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="subscription-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="subscription-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="subscription-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the subscription appears with updated name
    cy.get('[data-automation-id="subscription-edit-back-button"]').click()
    cy.url().should('include', '/subscriptions')
    
    // Search for the updated subscription
    cy.get('[data-automation-id="subscription-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the subscription appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all subscriptions are shown again
    cy.get('[data-automation-id="subscription-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for subscriptions', () => {
    // First create a subscription with a unique name
    cy.visit('/subscriptions/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="subscription-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="subscription-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="subscription-new-submit-button"]').click()
    cy.url().should('include', '/subscriptions/')
    
    // Navigate to list page
    cy.visit('/subscriptions')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the subscription
    cy.get('[data-automation-id="subscription-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the subscription
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all subscriptions are shown again
    cy.get('[data-automation-id="subscription-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
