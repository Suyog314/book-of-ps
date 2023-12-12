import { IRecipeNode, makeIRecipeNode } from "../../../../types";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { NodeCollectionConnection } from "../../../../nodes";

describe("Unit Test: InsertNode", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let nodeCollectionConnection: NodeCollectionConnection;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    nodeCollectionConnection = new NodeCollectionConnection(mongoClient);
    mongoClient.connect();
  });

  beforeEach(async () => {
    const response = await nodeCollectionConnection.clearNodeCollection();
    expect(response.success).toBeTruthy();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("finds all different cuisine types", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const time: number = 9;

    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "American",
      time,
      "authorId",
      [],
      "recipe"
    );
    const validNode2: IRecipeNode = makeIRecipeNode(
      "2",
      ["2"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "Korean",
      time,
      "authorId",
      ["3", "4"],
      "recipe"
    );
    const validNode3: IRecipeNode = makeIRecipeNode(
      "3",
      ["3"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "Mexican",
      time,
      "authorId",
      ["5"],
      "recipe"
    );
    const createResponse1 = await nodeCollectionConnection.insertNode(
      validNode1
    );
    expect(createResponse1.success).toBeTruthy();
    const createResponse2 = await nodeCollectionConnection.insertNode(
      validNode2
    );
    expect(createResponse2.success).toBeTruthy();
    const createResponse3 = await nodeCollectionConnection.insertNode(
      validNode3
    );
    expect(createResponse3.success).toBeTruthy();
    const getCuisinesRes = await nodeCollectionConnection.getCuisines();
    expect(getCuisinesRes.success).toBeTruthy();
    expect(getCuisinesRes.payload.length).toBe(3);
    expect(getCuisinesRes.payload.includes("American")).toBeTruthy();
    expect(getCuisinesRes.payload.includes("Korean")).toBeTruthy();
    expect(getCuisinesRes.payload.includes("Mexican")).toBeTruthy();
  });

  test("returns single instances of each cuisine type", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const time: number = 9;

    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "American",
      time,
      "authorId",
      [],
      "recipe"
    );
    const validNode2: IRecipeNode = makeIRecipeNode(
      "2",
      ["2"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "American",
      time,
      "authorId",
      ["3", "4"],
      "recipe"
    );
    const validNode3: IRecipeNode = makeIRecipeNode(
      "3",
      ["3"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "Mexican",
      time,
      "authorId",
      ["5"],
      "recipe"
    );
    const validNode4: IRecipeNode = makeIRecipeNode(
      "4",
      ["4"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      "Mexican",
      time,
      "authorId",
      [],
      "recipe"
    );
    const createResponse1 = await nodeCollectionConnection.insertNode(
      validNode1
    );
    expect(createResponse1.success).toBeTruthy();
    const createResponse2 = await nodeCollectionConnection.insertNode(
      validNode2
    );
    expect(createResponse2.success).toBeTruthy();
    const createResponse3 = await nodeCollectionConnection.insertNode(
      validNode3
    );
    expect(createResponse3.success).toBeTruthy();
    const createResponse4 = await nodeCollectionConnection.insertNode(
      validNode4
    );
    expect(createResponse4.success).toBeTruthy();
    const getCuisinesRes = await nodeCollectionConnection.getCuisines();
    expect(getCuisinesRes.success).toBeTruthy();
    expect(getCuisinesRes.payload.length).toBe(2);
    expect(getCuisinesRes.payload.includes("American")).toBeTruthy();
    expect(getCuisinesRes.payload.includes("Mexican")).toBeTruthy();
  });

  test("returns empty array when there are no available cuisines (no recipes)", async () => {
    const getCuisinesRes = await nodeCollectionConnection.getCuisines();
    expect(getCuisinesRes.success).toBeTruthy();
    expect(getCuisinesRes.payload.length).toBe(0);
  });
});
