describe('Dashboard Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display dashboards list page', () => {
    cy.visit('/dashboards')
    cy.get('h1').contains('Dashboards').should('be.visible')
    cy.get('[data-automation-id="dashboard-list-new-button"]').should('be.visible')
  })

  it('should navigate to new dashboard page', () => {
    cy.visit('/dashboards')
    cy.get('[data-automation-id="dashboard-list-new-button"]').click()
    cy.url().should('include', '/dashboards/new')
    cy.get('h1').contains('New Dashboard').should('be.visible')
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
    
    // Navigate back to list and verify the dashboard appears with updated name
    cy.get('[data-automation-id="dashboard-edit-back-button"]').click()
    cy.url().should('include', '/dashboards')
    
    // Search for the updated dashboard
    cy.get('[data-automation-id="dashboard-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the dashboard appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all dashboards are shown again
    cy.get('[data-automation-id="dashboard-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for dashboards', () => {
    // First create a dashboard with a unique name
    cy.visit('/dashboards/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="dashboard-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="dashboard-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="dashboard-new-submit-button"]').click()
    cy.url().should('include', '/dashboards/')
    
    // Navigate to list page
    cy.visit('/dashboards')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the dashboard
    cy.get('[data-automation-id="dashboard-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the dashboard
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all dashboards are shown again
    cy.get('[data-automation-id="dashboard-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
