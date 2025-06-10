const request = require("supertest");
const app = require("../../index");

// Category integration tests
describe("Category integration tests", () => {
  it("should create a new category", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Criação da categoria
    const categoryRes = await request(app).post("/category").send({
      name: "Viagem",
      type: "expense",
      userId: loginRes.body.userWithoutPassword.id,
    });

    expect(categoryRes.statusCode).toBe(201);
  });

  it("should list all categories", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Listagem das categorias
    const categoryRes = await request(app).get(
      `/category/${loginRes.body.userWithoutPassword.id}`
    );

    expect(categoryRes.statusCode).toBe(200);
  });
    
});
