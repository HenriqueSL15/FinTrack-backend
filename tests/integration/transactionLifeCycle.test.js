const request = require("supertest");
const app = require("../../index");

// Transaction integration tests
describe("Transaction integration tests", () => {
  it("should create a new transaction", async () => {
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

    // Criação da transação
    const transactionRes = await request(app)
      .post(
        `/transaction/${loginRes.body.userWithoutPassword.id}/${categoryRes.body.category.id}`
      )
      .send({
        description: "Viagem",
        amount: 1000,
        type: "expense",
        date: "2025-01-01",
      });

    expect(transactionRes.statusCode).toBe(201);
    expect(transactionRes.body.transaction).toBeDefined();
    expect(transactionRes.body.transaction.amount).toBe(1000);
  });

  it("should not create a transaction with invalid data", async () => {
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

    // Criação da transação com valor inválido
    const transactionRes = await request(app)
      .post(
        `/transaction/${loginRes.body.userWithoutPassword.id}/${categoryRes.body.category.id}`
      )
      .send({
        description: "Viagem",
        amount: "fasdfasdf",
        type: "expense",
        date: "2025-01-01",
      });

    expect(transactionRes.statusCode).toBe(400);
  });

  it("should list all transactions", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Listagem das transações
    const transactionRes = await request(app).get(
      `/transaction/${loginRes.body.userWithoutPassword.id}`
    );

    expect(transactionRes.statusCode).toBe(200);
    expect(Array.isArray(transactionRes.body.transactions)).toBe(true);
  });

  it("should delete a transaction", async () => {
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

    // Criação da transação
    const transactionRes = await request(app)
      .post(
        `/transaction/${loginRes.body.userWithoutPassword.id}/${categoryRes.body.category.id}`
      )
      .send({
        description: "Viagem",
        amount: 1000,
        type: "expense",
        date: "2025-01-01",
      });

    // Deleção da transação
    const deleteRes = await request(app).delete(
      `/transaction/${loginRes.body.userWithoutPassword.id}/${transactionRes.body.transaction.id}`
    );

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Transação deletada com sucesso!");
  });
});
