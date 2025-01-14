describe("User Sign-up and Login", function () {
  beforeEach(() => {
    cy.intercept("POST", "http://localhost:3001/login").as("login");
    cy.intercept("POST", "http://localhost:3001/graphql").as("graphql");
    cy.intercept("POST", "http://localhost:3001/notifications").as("notifications");
    cy.intercept("POST", "http://localhost:3001/transactions/public").as("transaction");
  });

  it("should redirect unauthenticated user to signin page", () => {
    cy.visit("/");
    cy.location("pathname").should("equal", "/signin"); //pathname - path after domain / caminho após domínio
    cy.visualSnapshot("Signin Page");
  });

  it("should redirect to the home page after login", () => {
    cy.visit("/");
    cy.get("#username-label").type("Darren.Schroeder16");
    cy.get('[data-test="signin-password"]').type("s3cret");
    cy.get('[data-test="signin-submit"]').should("be.visible").click();
    cy.wait("@login");
    cy.wait("@graphql");
    //cy.wait("@notifications");
    //cy.wait("@transaction");
  });

  it("should remember a user for 30 days after login", () => {});

  it.only("should allow a visitor to sign-up, login, and logout", () => {
    const userSignUpData = {
      firstName: "Jurema",
      lastName: "Silva",
      username: "Jureminha",
      password: "s3cret",
    };

    const bankAccountData = {
      bankName: "The Best Bank",
      routingNumber: "987654321",
      accountNumber: "123456789",
    };

    cy.visit("/");

    //sign-up
    cy.get('[data-test="signup"]').click();
    cy.get("#firstName").type(userSignUpData.firstName);
    cy.get("#lastName").type(userSignUpData.lastName);
    cy.get("#username").type(userSignUpData.username);
    cy.get("#password").type(userSignUpData.password);
    cy.get("#confirmPassword").type(userSignUpData.password);
    cy.get('[data-test="signup-submit"]').should("be.visible").click();

    //sign-in
    cy.location("pathname").should("equal", "/signin");
    cy.get("#username").type(userSignUpData.username);
    cy.get("#password").type(userSignUpData.password);

    cy.get(".PrivateSwitchBase-input").check();
    cy.get('[data-test="signin-submit"]').should("be.visible").click();

    //onboarding
    cy.get('[data-test="user-onboarding-dialog"]').should("be.visible").click();
    cy.get('[data-test="user-onboarding-next"]').should("be.visible").click();

    cy.get("#bankaccount-bankName-input").type(bankAccountData.bankName);
    cy.get("#bankaccount-routingNumber-input").type(bankAccountData.routingNumber);
    cy.get("#bankaccount-accountNumber-input").type(bankAccountData.accountNumber);
    cy.get('[data-test="bankaccount-submit"]').should("be.visible").click();

    cy.get('[data-test="user-onboarding-dialog-content"]').should("be.visible");
    cy.get('[data-test="user-onboarding-next"]').should("be.visible").click();

    cy.get('[data-test="sidenav-signout"] > .MuiListItemText-root > .MuiTypography-root')
  });

  it("should display login errors", () => {});

  it("should display signup errors", () => {});

  it("should error for an invalid user", () => {});

  it("should error for an invalid password for existing user", () => {});
});
