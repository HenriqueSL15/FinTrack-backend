const request = require("supertest");
const app = require("../../index");

// User integration tests
describe("User integration tests", () => {
  it("should create a new user and login sucessfully", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.userWithoutPassword).toBeDefined();
  });

  it("should not login with invalid credentials", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Tenta logar com credenciais inválidas
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "654321" });

    expect(loginRes.statusCode).toBe(401);
  });

  it("should not create a user with an existing email", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Tenta criar outro usuário com o mesmo email
    const registerRes = await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    expect(registerRes.statusCode).toBe(409);
  });

  it("should update user information", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Atualiza as informações do usuário
    const updateRes = await request(app)
      .put(`/users/${loginRes.body.userWithoutPassword.id}`)
      .send({
        theme: "light",
        currency: "EUR",
      })
      .set(
        "Cookie",
        "accessToken=" + loginRes.headers["set-cookie"][0].split("=")[1]
      );

    expect(updateRes.statusCode).toBe(200);
  });
});
