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
    expect(goalRes.body.goal).toBeDefined();
    expect(goalRes.body.goal.description).toBe("Viagem");
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
    expect(Array.isArray(goalRes.body.goals)).toBe(true);
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
        date: "01-01-2025",
      });

    // Atualização do objetivo
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: 10000,
        currentAmount: 1000,
        targetDate: "2025-01-01T00:00:00.000Z",
        date: "01-01-2025",
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.goal.targetAmount).toBe(10000);
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
        date: "01-01-2025",
      });

    // Atualização do objetivo com valor inválido
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: "fasdfasdf",
        targetDate: "2025-01-01T00:00:00.000Z",
        date: "01-01-2025",
      });

    expect(updateRes.statusCode).toBe(400);
  });

  it("should update only the status of a goal", async () => {
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

    // Atualização apenas do status
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        status: "completed",
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.goal.status).toBe("completed");
  });

  it("should return 400 if no changes are made during update", async () => {
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
        currentAmount: 0,
      });

    // Atualização sem alterações
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 0,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

    expect(updateRes.statusCode).toBe(400);
    expect(updateRes.body.message).toBe("Nada foi alterado");
  });

  it("should return 400 if amount is less than current amount during update", async () => {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24);

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
        targetDate: date,
      });

    // Atualização com amount menor que currentAmount
    const updateRes1 = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 900,
        targetDate: date,
      });

    const updateRes2 = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 500,
        targetDate: date,
      });

    expect(updateRes2.statusCode).toBe(400);
  });

  it("should return 400 if amount is NaN during update", async () => {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24);

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
        targetDate: date,
      });

    // Atualização com amount NaN
    const updateRes = await request(app)
      .put(
        `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}`
      )
      .send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: "not-a-number",
        targetDate: date,
      });

    expect(updateRes.statusCode).toBe(400);
  });

  it("should delete a goal", async () => {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24);

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
        targetDate: date,
      });

    // Deleção do objetivo
    const deleteRes = await request(app).delete(
      `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}/100`
    );

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Objetivo deletado com sucesso!");
  });

  it("should delete a goal with percentage other than 100", async () => {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24);

    // Criação do usuário
    await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });

    // Login na conta recém criada
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "test@ex.com", password: "123456" });

    // Deleção do objetivo com percentage diferente de 100
    const goalRes = await request(app)
      .post(`/goal/${loginRes.body.userWithoutPassword.id}`)
      .send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: date,
      });

    const deleteRes = await request(app).delete(
      `/goal/${loginRes.body.userWithoutPassword.id}/${goalRes.body.goal.id}/50`
    );

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Objetivo deletado com sucesso!");
  });
});
