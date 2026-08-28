describe('Event Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should create a new event document', () => {
    cy.visit('/events/new')
    
    const timestamp = Date.now()
    const itemName = `test-event-${timestamp}`
    
    cy.get('[data-automation-id="event-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="event-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="event-new-status-input"]').type('active')
    cy.get('[data-automation-id="event-new-submit-button"]').click()
    
    // Should redirect to view page after creation
    cy.url().should('include', '/events/')
    cy.url().should('not.include', '/events/new')
    
    // Verify the event name is displayed on view page (in a text field, not h1)
    cy.get('input[readonly]').first().should('have.value', itemName)
  })
})

