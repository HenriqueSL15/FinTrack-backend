const request = require("supertest");
const app = require("../../index");

// Budget integration tests
describe("Budget integration tests", () => {
  it("should create a new budget", async () => {
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

    // Criação do orçamento
    const budgetRes = await request(app)
      .post(
        `/budget/${loginRes.body.userWithoutPassword.id}/${categoryRes.body.category.id}`
      )
      .send({ monthYear: "2025-01-01T00:00:00.000Z", limitAmount: 1000 });

    expect(budgetRes.statusCode).toBe(201);
  });

  it("should not create a budget with invalid data", async () => {
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

    // Criação do orçamento
    const budgetRes = await request(app)
      .post(
        `/budget/${loginRes.body.userWithoutPassword.id}/${categoryRes.body.category.id}`
      )
      .send({
        monthYear: "2025-01-01T00:00:00.000Z",
        limitAmount: "fasdfasdf",
      });

    expect(budgetRes.statusCode).toBe(400);
  });

  it("should list all budgets", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Listagem dos orçamentos
    const budgetRes = await request(app).get(
      `/budget/${loginRes.body.userWithoutPassword.id}`
    );

    expect(budgetRes.statusCode).toBe(200);
  });
});
