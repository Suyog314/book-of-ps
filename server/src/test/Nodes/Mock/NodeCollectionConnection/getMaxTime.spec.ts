import {
  Cuisine,
  INode,
  IRecipeNode,
  isSameNode,
  makeINode,
  makeIRecipeNode,
} from "../../../../types";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { NodeCollectionConnection } from "../../../../nodes";

describe("Unit Test: getMaxTime", () => {
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

  test("finds the recipe with the longest time to finish a recipe", async () => {
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
    const getMaxTimeRes = await nodeCollectionConnection.getMaxTime();
    expect(getMaxTimeRes.success).toBeTruthy();
    expect(isSameNode(validNode3, getMaxTimeRes.payload)).toBeTruthy();
  });

  test("fails when there is an empty database", async () => {
    const getMaxTimeRes = await nodeCollectionConnection.getMaxTime();
    expect(getMaxTimeRes.success).toBeFalsy();
  });

  test("fails when there are no recipe nodes in database", async () => {
    const validNode: INode = makeINode("1", ["1"]);
    const createResponse = await nodeCollectionConnection.insertNode(validNode);
    expect(createResponse.success).toBeTruthy();
    const getMaxTimeRes = await nodeCollectionConnection.getMaxTime();
    expect(getMaxTimeRes.success).toBeFalsy();
  });
});
