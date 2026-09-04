/**
 * Profile page coverage under `/customer/`.
 *
 * Reads use a plain `customer` token (least privilege). Writes use the same role with a
 * case-aligned `profile_id` claim: spa_utils Cypress defaults mint uppercase ObjectIds
 * (`A000…`), while `customer_api` compares against Mongo's lowercase `str(ObjectId)`.
 * An `admin` role would mask that ownership check — do not reintroduce it here.
 */
describe('Profile Domain', () => {
  const SEED_PROFILE_ID = 'A00000000000000000000001'
  /** Lowercase form of the seed id — matches Mongo ObjectId stringification used by the API. */
  const OWNING_PROFILE_ID = SEED_PROFILE_ID.toLowerCase()

  function loginOwningCustomer() {
    cy.task<{ token: string; expiresAt: string }>('signCypressJwt', {
      roles: ['customer'],
      secret: Cypress.env('JWT_SECRET'),
      profile_id: OWNING_PROFILE_ID,
    }).then(({ token, expiresAt }) => {
      cy.visitPrefixed('/customer/profile/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('access_token', token)
          win.localStorage.setItem('token_expires_at', expiresAt)
          win.localStorage.setItem('user_roles', JSON.stringify(['customer']))
        },
      })
    })
  }

  it('should load profile page with profile fields for a customer token', () => {
    cy.login(['customer'])
    cy.visitPrefixed('/customer/profile/')

    cy.get('[data-automation-id="profile-view-page"]').should('be.visible')
    cy.get('[data-automation-id="profile-view-display-name-input"]').should('be.visible')
    cy.get('[data-automation-id="profile-view-description-input"]').should('be.visible')
    cy.get('[data-automation-id="profile-view-status-input"]').should('be.visible')
  })

  it('should update profile description as the owning customer (not admin)', () => {
    loginOwningCustomer()

    const timestamp = Date.now()
    const updatedDescription = `Updated profile description ${timestamp}`

    cy.get('[data-automation-id="profile-view-description-input"]')
      .find('textarea')
      .clear()
      .type(updatedDescription)
      .blur()

    cy.wait(1000)

    loginOwningCustomer()
    cy.get('[data-automation-id="profile-view-description-input"]')
      .find('textarea')
      .should('have.value', updatedDescription)
  })

  it('should receive API 403 when a customer JWT profile_id does not match the document', () => {
    // Adversarial: default spa_utils claim casing fails ownership without admin privilege.
    cy.task<{ token: string }>('signCypressJwt', {
      roles: ['customer'],
      secret: Cypress.env('JWT_SECRET'),
      profile_id: SEED_PROFILE_ID,
    }).then(({ token }) => {
      cy.request({
        method: 'PATCH',
        url: `/customer/api/profile/${SEED_PROFILE_ID}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { description: 'must-not-persist' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(403)
      })
    })
  })
})
