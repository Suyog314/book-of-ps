import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BackendNodeGateway } from "../../../../nodes";
import { Cuisine, IRecipeNode, makeIRecipeNode } from "../../../../types";

describe("Unit Test: Get Max Time", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let backendNodeGateway: BackendNodeGateway;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    backendNodeGateway = new BackendNodeGateway(mongoClient);
    mongoClient.connect();
  });

  beforeEach(async () => {
    const response = await backendNodeGateway.deleteAll();
    expect(response.success).toBeTruthy();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("returns maximum time", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const cuisine: Cuisine = "American";

    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      50,
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
      cuisine,
      10,
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
      cuisine,
      60,
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
      cuisine,
      60,
      "authorId",
      [],
      "recipe"
    );
    const response1 = await backendNodeGateway.createNode(validNode1);
    expect(response1.success).toBeTruthy();
    const response2 = await backendNodeGateway.createNode(validNode2);
    expect(response2.success).toBeTruthy();
    const response3 = await backendNodeGateway.createNode(validNode3);
    expect(response3.success).toBeTruthy();
    const response4 = await backendNodeGateway.createNode(validNode4);
    expect(response4.success).toBeTruthy();
    const getMaxTimeRes = await backendNodeGateway.getMaxTime();
    expect(getMaxTimeRes.success).toBeTruthy();
    expect(getMaxTimeRes.payload).toBe(60);
  });

  test("failure when no roots exist (empty database)", async () => {
    const getResponse = await backendNodeGateway.getMaxTime();
    expect(getResponse.success).toBeFalsy();
  });
});
