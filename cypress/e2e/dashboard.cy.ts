describe('Dashboard Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should create a new dashboard', () => {
    cy.visit('/dashboards/new')
    
    const timestamp = Date.now()
    const itemName = `test-dashboard-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="dashboard-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="dashboard-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="dashboard-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/dashboards/')
    cy.url().should('not.include', '/dashboards/new')
    
    // Verify the dashboard name is displayed on edit page
    cy.get('[data-automation-id="dashboard-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a dashboard', () => {
    // First create a dashboard
    cy.visit('/dashboards/new')
    const timestamp = Date.now()
    const itemName = `test-dashboard-update-${timestamp}`
    const updatedName = `updated-dashboard-${timestamp}`
    
    cy.get('[data-automation-id="dashboard-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="dashboard-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="dashboard-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/dashboards/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="dashboard-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="dashboard-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="dashboard-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="dashboard-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="dashboard-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="dashboard-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
  })
})

