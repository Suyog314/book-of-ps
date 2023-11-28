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
    const description: INode = makeINode(
      "1",
      ["1"],
      null,
      null,
      null,
      "test description"
    );
    const step1: INode = makeINode("2", ["2"], null, null, "step1");
    const step2: INode = makeINode("3", ["3"], null, null, "step2");
    const steps: INode[] = [step1, step2];
    const ingredients: string[] = ["ing1", "ing2"];
    const serving: number = 4;
    const cuisine: Cuisine = "Korean";
    const time: number = 9;
    const recipeNode: IRecipeNode = makeIRecipeNode(
      "4",
      ["4"],
      description,
      ingredients,
      steps,
      serving,
      cuisine,
      time
    );
    const createResponse = await nodeCollectionConnection.insertNode(
      recipeNode
    );
    expect(createResponse.success).toBeTruthy();
    const findNodeResp = await nodeCollectionConnection.findNodeById("4");
    expect(findNodeResp.success).toBeTruthy();
    const nodeQuery: IRecipeNode = findNodeResp.payload as IRecipeNode;
    expect(nodeQuery.description.content).toEqual("test description");
    expect(nodeQuery.ingredients.length).toEqual(2);
    expect(nodeQuery.ingredients[0]).toEqual("ing1");
    expect(nodeQuery.steps.length).toEqual(2);
    expect(nodeQuery.steps[1].title).toEqual("step2");
    expect(nodeQuery.serving).toEqual(4);
    expect(nodeQuery.cuisine).toEqual("Korean");
    expect(nodeQuery.time).toEqual(9);
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
      null
    );
    const createResponse = await nodeCollectionConnection.insertNode(
      recipeNode
    );
    expect(createResponse.success).toBeTruthy();
    const findNodeResp = await nodeCollectionConnection.findNodeById("1");
    expect(findNodeResp.success).toBeTruthy();
    const nodeQuery: IRecipeNode = findNodeResp.payload as IRecipeNode;
    expect(nodeQuery.description).toBeNull();
    expect(nodeQuery.ingredients).toBeNull();
    expect(nodeQuery.steps).toBeNull();
    expect(nodeQuery.serving).toBeNull();
    expect(nodeQuery.cuisine).toBeNull();
    expect(nodeQuery.time).toBeNull();
  });
});
