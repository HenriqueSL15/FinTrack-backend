const request = require("supertest");
const app = require("../../index");

// Goal integration tests
describe("Goal integration tests", () => {
  it("should create a new goal", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Criação do objetivo
    const goalRes = await request(app)
      .post(`/goal/${loginRes.body.userWithoutPassword.id}`)
      .send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

    expect(goalRes.statusCode).toBe(201);
  });

  it("should list all goals", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Listagem dos objetivos
    const goalRes = await request(app).get(
      `/goal/${loginRes.body.userWithoutPassword.id}`
    );

    expect(goalRes.statusCode).toBe(200);
  });

  it("should update a goal", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Criação do objetivo
    const goalRes = await request(app)
      .post(`/goal/${loginRes.body.userWithoutPassword.id}`)
      .send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

    // Atualização do objetivo
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: 10000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

    expect(updateRes.statusCode).toBe(200);
  });

  it("should not update a goal with invalid data", async () => {
    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Criação do objetivo
    const goalRes = await request(app)
      .post(`/goal/${loginRes.body.userWithoutPassword.id}`)
      .send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

    // Atualização do objetivo
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: "fasdfasdf",
        targetDate: "2025-01-01T00:00:00.000Z",
      });

    expect(updateRes.statusCode).toBe(400);
  });
});
