describe('Property detail navigation', () => {
  it('navigates to detail page when clicking View Details', () => {
    cy.visit('/listings')
    cy.contains('View Details').first().click()
    cy.url().should('include', '/properties/')
    cy.contains('Contact Owner')
  })
})
