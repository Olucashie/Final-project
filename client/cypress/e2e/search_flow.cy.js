describe('Search flow', () => {
  it('submits search and shows listings', () => {
    cy.visit('/')
    cy.get('input[name="location"]').type('Downtown')
    cy.contains('button','Search').click()
    cy.url().should('include', '/listings')
    cy.get('[class*="grid"]').find('div').should('exist')
  })
})
