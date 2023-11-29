import {
  Cuisine,
  INode,
  IRecipeNode,
  makeINode,
  makeIRecipeNode,
} from "../../../../types";
import { NodeCollectionConnection } from "../../../../nodes";

import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Unit Test: createRecipeNode", () => {
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

  test("successfully creates recipe node", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const cuisine: Cuisine = "Korean";
    const time: number = 9;
    const authorId: string = "authorId";
    const recipeNode: IRecipeNode = makeIRecipeNode(
      "4",
      ["4"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      authorId
    );
    const createResponse = await nodeCollectionConnection.insertNode(
      recipeNode
    );
    expect(createResponse.success).toBeTruthy();
    const findNodeResp = await nodeCollectionConnection.findNodeById("4");
    expect(findNodeResp.success).toBeTruthy();
    const nodeQuery: IRecipeNode = findNodeResp.payload as IRecipeNode;
    expect(nodeQuery.descriptionID).toEqual("descriptionId");
    expect(nodeQuery.ingredientsID).toEqual("ing1");
    expect(nodeQuery.stepsID).toEqual("stepId");
    expect(nodeQuery.serving).toEqual(4);
    expect(nodeQuery.cuisine).toEqual("Korean");
    expect(nodeQuery.time).toEqual(9);
    expect(nodeQuery.authorId).toEqual("authorId");
  });

  test("successfully creates recipe node with all empty fields", async () => {
    const recipeNode: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    const createResponse = await nodeCollectionConnection.insertNode(
      recipeNode
    );
    expect(createResponse.success).toBeTruthy();
    const findNodeResp = await nodeCollectionConnection.findNodeById("1");
    expect(findNodeResp.success).toBeTruthy();
    const nodeQuery: IRecipeNode = findNodeResp.payload as IRecipeNode;
    expect(nodeQuery.descriptionID).toBeNull();
    expect(nodeQuery.ingredientsID).toBeNull();
    expect(nodeQuery.stepsID).toBeNull();
    expect(nodeQuery.serving).toBeNull();
    expect(nodeQuery.cuisine).toBeNull();
    expect(nodeQuery.time).toBeNull();
    expect(nodeQuery.authorId).toBeNull();
  });
});
