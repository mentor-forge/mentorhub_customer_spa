describe('Subscription Domain', () => {
  beforeEach(() => {
    cy.login()
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
  })
})

