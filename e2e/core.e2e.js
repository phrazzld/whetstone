const { reloadApp } = require("detox-expo-helpers");

//const sleep = (ms) => {
//  return new Promise((resolve) => setTimeout(resolve, ms));
//};

describe("Example", () => {
  // TODO: Create new user beforeAll
  beforeAll(async () => {
    await reloadApp();
    const signUpText = element(by.label("Sign Up")).atIndex(1);
    await waitFor(signUpText).toBeVisible().withTimeout(20000);
  });

  // TODO: Delete the user afterAll

  it("should have authentication screen", async () => {
    await expect(element(by.label("Sign Up")).atIndex(1)).toBeVisible();
    await expect(element(by.label("Sign In")).atIndex(1)).toBeVisible();
    await expect(element(by.label("Email")).atIndex(1)).toBeVisible();
    await expect(element(by.label("Password")).atIndex(1)).toBeVisible();
  });

  test("sign up for a new account", async () => {
    await element(by.id("EmailInput")).tap();
    await element(by.id("EmailInput")).typeText("detox@test.test");
    await element(by.id("PasswordInput")).tap();
    await element(by.id("PasswordInput")).typeText("detox-test");
    await element(by.id("SignUpButton")).tap();
    await waitFor(element(by.label("No books yet")).atIndex(1))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.label("Books")).atIndex(1))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.label("Profile")).atIndex(1))
      .toBeVisible()
      .withTimeout(5000);
  });
});
