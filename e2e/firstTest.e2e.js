const { reloadApp } = require("detox-expo-helpers");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe("Example", () => {
  beforeAll(async () => {
    await reloadApp();
    //const signUpText = element(by.text("Sign Up"));
    await sleep(4000);
    //await waitFor(signUpText).toBeVisible().withTimeout(20000);
  });

  it("should have signup screen", async () => {
    await expect(element(by.label("Sign Up")).atIndex(1)).toBeVisible();
  });
});
