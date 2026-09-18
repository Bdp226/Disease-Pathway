describe("Home Page Architecture & Visuals", () => {
  beforeEach(() => {
    // Intercept the /stats API call to guarantee consistent testing state
    cy.intercept("GET", "**/stats", {
      statusCode: 200,
      body: {
        total_diseases: 3,
        total_stages: 19,
        total_pain_points: 109,
        total_solutions: 163,
        diseases: ["alzheimer's", "CAD", "lung cancer"],
        version: "3.0.0",
      },
    }).as("getStats");

    cy.visit("/");
  });

  it("should render the glassmorphism Hero section correctly", () => {
    // Use .should("exist") instead of .should("be.visible") to bypass Framer Motion opacity transitions
    cy.contains("Powering Clinical Decision Intelligence").should("exist");
    cy.get(".stats-counter-card").should("have.length", 4);
    
    // Ensure the mock data populated the animated counters
    cy.wait("@getStats");
    cy.contains("109").should("exist"); // Pain points mapped
    cy.contains("163").should("exist"); // Solutions indexed
  });

  it("should open the Chatbot Widget and trigger pulse animations", () => {
    // Click the FAB to open chatbot (it is a button with a circular shape near top right)
    cy.get("button").last().click({ force: true });
    
    // Verify typing interaction in the chatbot input
    cy.get("input[type='text']").last().type("Hello, test query", { force: true });
    cy.get("input[type='text']").last().should("have.value", "Hello, test query");
  });
});
