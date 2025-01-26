describe("User Sign-up and Login", function () {
  beforeEach(() => {
    //Generates fresh database seeds for json files in /data
    cy.task("db:seed");
    cy.intercept("POST", "http://localhost:3001/login").as("login");
    cy.intercept("POST", "http://localhost:3001/graphql").as("graphql");
    cy.intercept("POST", "http://localhost:3001/notifications").as("notifications");
    cy.intercept("POST", "http://localhost:3001/transactions/public").as("transaction");
  });

  it("should redirect unauthenticated user to signin page", () => {
    cy.visit("/");
    cy.location("pathname").should("equal", "/signin"); //pathname - path after domain / caminho após domínio
    //cy.percySnapshot("Signin Page");
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

  it("should allow a visitor to sign-up, login, and logout", () => {
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
    cy.get('[data-test="user-onboarding-dialog-title"]').should("contain", "Finished");
    cy.get('[data-test="user-onboarding-next"]').should("be.visible").click();

    cy.wait("@graphql");
    //Signout
    // eslint-disable-next-line prettier/prettier
    cy.get('[data-test="sidenav-signout"]').should("be.visible").click();
    cy.location("pathname").should("be.equal", "/signin");
    //cy.percySnapshot("Signout");
  });

  it("should display login errors", () => {
    cy.visit("/");
    cy.location("pathname").should("equal", "/signin");

    //username error
    cy.get("#username").type("nome");
    cy.get("#username").clear();
    cy.get("#password").type("senha");
    cy.get("#password").blur();

    cy.get("#username-helper-text")
      .should("be.visible")
      .should("have.text", "Username is required");
    //cy.percySnapshot("Username error");

    //password error
    cy.get("#username").type("nome");
    cy.get("#password").clear().type("ana").blur();

    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");
    //cy.percySnapshot("Passwor error");

    //cy.getBySel("signin-submit").should("be.disabled");
    //cy.percySnapshot("Sign In Submit Disabled");
  });

  it("should display signup errors", () => {
    cy.visit("/signup");

    cy.get("#firstName").clear().blur();
    cy.get("#firstName-helper-text").should("be.visible").and("contain", "First Name is required");
    cy.get("#lastName").clear().blur();
    cy.get("#lastName-helper-text").should("be.visible").and("contain", "Last Name is required");
    cy.get("#username").clear().blur();
    cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
    cy.get("#password").clear().blur();
    cy.get("#password-helper-text").should("be.visible").and("contain", "Enter your password");
    cy.get("#confirmPassword").clear().blur();
    cy.get("#confirmPassword-helper-text")
      .should("be.visible")
      .and("contain", "Confirm your password");
    cy.get("#password").clear().type("abc");
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");
    cy.get("#confirmPassword").clear().type("a");
    cy.get("#confirmPassword-helper-text")
      .should("be.visible")
      .and("contain", "Password does not match");

    cy.get('[data-test="signup-submit"]').should("be.disabled");
  });

  it.only("should error for an invalid user", () => {
    cy.visit("/");
    cy.location("pathname").should("equal", "/signin");

    cy.get("#username-label").type("abcd");
    cy.get('[data-test="signin-password"]').type("s3cret");
    cy.get('[data-test="signin-submit"]').should("be.visible").click();
    cy.wait("@login");
    cy.get('[data-test="signin-error"]')
      .should("be.visible")
      .and("contain", "Username or password is invalid");
  });

  it("should error for an invalid password for existing user", () => {});
});
